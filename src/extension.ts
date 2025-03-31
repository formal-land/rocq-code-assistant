import * as vscode from 'vscode';
import * as utils from './utils';
import * as ollama from './model-providers/ollama';
import * as openAI from './model-providers/openai';
import * as extractors from './syntax/extractors';
import * as Prettier from './syntax/prettier/prettier';
import { Tokenizer } from './syntax/tokenizer';
import { CoqLSPClient } from './coq-lsp-client';
import { Scope } from './syntax/scope';
import { Proof } from './proof';
import { BasicLLM } from './oracles/basic-LLM/oracle';

export namespace Commands {
  export const HELLO_WORLD = 'rocq-coding-assistant.hello-world';
  export const SELECT_MODEL = 'rocq-coding-assistant.select-model';
  export const SOLVE = 'rocq-coding-assistant.solve';
}

let coqLSPClient: CoqLSPClient;
let coqTokenizer: Tokenizer;
let selectedModel: vscode.LanguageModelChat | undefined;
let registeredCustomModels: vscode.LanguageModelChat[] = [];

export async function activate(context: vscode.ExtensionContext) {
  coqLSPClient = CoqLSPClient.get();
  coqTokenizer = Tokenizer.get();

  updateLanguageModels();

  const regDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(didChangeConfigurationCallback);
  context.subscriptions.push(regDidChangeConfiguration);

  await updateLanguageModels();

  const regHelloWorld = vscode.commands.registerCommand(Commands.HELLO_WORLD, helloWorldCallback);
  context.subscriptions.push(regHelloWorld);

  const regSelectModel = vscode.commands.registerCommand(Commands.SELECT_MODEL, selectModelCallback);
  context.subscriptions.push(regSelectModel);

  const regSolve = vscode.commands.registerTextEditorCommand(Commands.SOLVE,
    async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, resource?: any, proofName?: string) => {
      while (!selectedModel) await vscode.commands.executeCommand('rocq-coding-assistant.select-model');

      const { proof, ppProof, success } = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Solving theorem...', cancellable: true }, 
        (progress, cancellationToken) => solveCallback(textEditor, edit, resource, proofName, cancellationToken));
      
      if (!success) {
        const selection = await vscode.window.showInformationMessage('Rocq code assistant couldn\'t find a proof. Do you want to show it anyway?', 'Yes', 'No');
        if (selection === 'No') return;
      }

      textEditor.edit(edit => edit.replace(proof.metadata.editorLocation, ppProof));
    }
  );
  context.subscriptions.push(regSolve);
}

export function deactivate() {
  if (coqLSPClient && coqLSPClient.isRunning()) 
    coqLSPClient.dispose();
}

async function helloWorldCallback() {
  const response = await selectedModel?.sendRequest([ vscode.LanguageModelChatMessage.User('Hello world!') ]);
  let answer = [];
  if (response)
    for await (const chunk of response.text)
      answer.push(chunk);
  vscode.window.showInformationMessage(answer.join(' '));
  return 0;
}

async function solveCallback(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, resource?: vscode.Uri, proofName?: string, cancellationToken?: vscode.CancellationToken) {
  if (!textEditor) {
    vscode.window.showErrorMessage('No active text editor available.');
    throw new Error('No active text editor available.');
  }

  const tokenizedText = await coqTokenizer.tokenize(textEditor.document.getText(), Scope.PROOF);

  const proofTokens = proofName ?
    extractors.extractProofTokensFromName(proofName, tokenizedText) :
    extractors.extractProofTokensFromPosition(textEditor.selection.active, tokenizedText);

  if (!proofTokens) {
    vscode.window.showErrorMessage('Theorem not found.');
    throw new Error('Theorem not found.');
  }

  const proof = await Proof.fromTokens(resource ? resource.toString() : textEditor.document.uri.toString(), proofTokens, cancellationToken);
  const success = await proof.autocomplete([new BasicLLM(selectedModel as vscode.LanguageModelChat)], cancellationToken);
  const ppProof = await Prettier.pp(selectedModel as vscode.LanguageModelChat, proof.toString());
  return { proof, ppProof, success };
}

async function selectModelCallback(modelId?: string) {
  function modelQuickPickItemDetail(model: vscode.LanguageModelChat) {
    const details = [];
  
    if (model.family) details.push(`family: ${model.family}`);
    if (model.version) details.push(`version: ${model.version}`);
    if (model.vendor) details.push(`vendor: ${model.vendor}`);
  
    return details.join(', ');
  }

  const models = await vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, 
    async () => registeredCustomModels.concat(await vscode.lm.selectChatModels()));
  
  const quickPickItems = models
    .toSorted((model1, model2) => {
      if (model1 === selectedModel) return -1;
      if (model2 === selectedModel) return 1;
      else return 0; })
    .map(model => ({
      id: model.id,
      label: model.vendor === 'copilot' ? `$(copilot) ${model.name}` : `$(sparkle) ${model.name}`,
      description: model === selectedModel ? 'Selected' : undefined,
      detail: modelQuickPickItemDetail(model) }));

  if (!modelId)
    modelId = (await vscode.window.showQuickPick(quickPickItems))?.id;

  const pickedModel = models.find(model => model.id === modelId);
  if (pickedModel)
    selectedModel = pickedModel;

  return 0;
}

async function updateLanguageModels() {
  updateCustomOllamaLanguageModel();
  updateCustomOpenAILanguageModel();
}

async function updateCustomOllamaLanguageModel() {
  registeredCustomModels = registeredCustomModels.filter(model => model.vendor !== 'Ollama');

  const isOllamaEnabled = utils.getConfBoolean('provider.ollama.enabled', false);
  if (!isOllamaEnabled) return;

  const hostAddress = utils.getConfString('provider.ollama.host.address', '127.0.0.1');
  const hostPort = utils.getConfString('provider.ollama.host.port', '11434');
  const host = `http://${hostAddress}:${hostPort}`;

  const modelMetadata = {
    id: `rocq-coding-assistant:${utils.getConfString('provider.ollama.model.name', '')}`,
    name: utils.getConfString('provider.ollama.model.name', ''),
    vendor: 'Ollama',
    family: utils.getConfString('provider.ollama.model.name', ''),
    version: '',
    maxInputTokens: Infinity,
    maxOutputTokens: Infinity
  };

  const ollamaModelProvider = await ollama.create(modelMetadata.name, modelMetadata, host);
  registeredCustomModels.push(ollamaModelProvider);

  if (registeredCustomModels.concat(await vscode.lm.selectChatModels()).length === 1)
    selectedModel = registeredCustomModels[0];
}

async function updateCustomOpenAILanguageModel() {
  registeredCustomModels = registeredCustomModels.filter(model => model.vendor !== 'OpenAI');

  const isOpenAIEnabled = utils.getConfBoolean('provider.openai.enabled', false);
  if (!isOpenAIEnabled) return;

  const modelMetadata = {
    id: `rocq-coding-assistant:${utils.getConfString('provider.openai.model.name', '')}`,
    name: utils.getConfString('provider.openai.model.name', ''),
    vendor: 'OpenAI',
    family: utils.getConfString('provider.openai.model.name', ''),
    version: '',
    maxInputTokens: utils.getConfNumber('provider.openai.model.context-widows', Infinity),
    maxOutputTokens: utils.getConfNumber('provider.openai.model.max-output-tokens', Infinity)
  };

  const openAIModelProvider = openAI.create(
    modelMetadata.name, modelMetadata, utils.getConfString('provider.openai.api-key-var-name', 'OPENAI_API_KEY'));
  registeredCustomModels.push(openAIModelProvider);

  if (registeredCustomModels.concat(await vscode.lm.selectChatModels()).length === 1)
    selectedModel = registeredCustomModels[0];
}

function didChangeConfigurationCallback(event: vscode.ConfigurationChangeEvent) {
  if (!event.affectsConfiguration('rocq-coding-assistant'))
    return;

  if (event.affectsConfiguration('rocq-coding-assistant.provider.ollama'))
    updateCustomOllamaLanguageModel();
  if (event.affectsConfiguration('rocq-coding-assistant.provider.openai'))
    updateCustomOpenAILanguageModel();
}