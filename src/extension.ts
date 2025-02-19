import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as utils from './utils';
import * as tokenizer from './syntax/tokenizer';
import * as cpqLSP from './coq-lsp-client';
import * as ollamaModelProvider from './model-providers/ollama';
import * as openAIModelProvider from './model-providers/openai';
import * as extractors from './syntax/extractors';
import * as basicLLM from './oracles/basic-LLM/basic-LLM';
import { search } from './search';

namespace commands {
  export const HELLO_WORLD = 'rocq-coding-assistant.hello-world';
  export const SELECT_MODEL = 'rocq-coding-assistant.select-model';
  export const SOLVE = 'rocq-coding-assistant.solve';
}

let coqLSPClient: LanguageClient | undefined;
let selectedModel: vscode.LanguageModelChat | undefined;
let coqTokenizer: tokenizer.Tokenizer | undefined;

async function registerLanguageModels(context: vscode.ExtensionContext) {
  const isOllamaEnabled = utils.getConfBoolean('ollama.enabled', false);
  if (isOllamaEnabled) {
    const hostAddress = utils.getConfString('ollama.host.address', '127.0.0.1');
    const hostPort = utils.getConfString('ollama.host.port', '11434');
    const host = `http://${hostAddress}:${hostPort}`;
    
    const client = ollamaModelProvider.init(host);
    const models = (await client.list()).models; 
    if (models.map(model => model.name).includes(utils.getConfString('ollama.model.name', ''))) {
      const modelMetadata = {
        name: utils.getConfString('ollama.model.name', ''),
        vendor: 'Ollama',
        family: '',
        version: '',
        maxInputTokens: Infinity,
        maxOutputTokens: Infinity
      };
      const regModel = ollamaModelProvider.registerLanguageModel(client, modelMetadata.name, modelMetadata);
      context.subscriptions.push(regModel);
    }
  }

  const isOpenAIEnabled = utils.getConfBoolean('openai.enabled', false);
  if (isOpenAIEnabled) {
    const client = openAIModelProvider.init(utils.getConfString('openai.api-key-var-name', 'OPENAI_API_KEY'));
    const modelMetadata = {
      name: utils.getConfString('openai.model.name', 'o1-mini'),
      vendor: 'OpenAI',
      family: '',
      version: '',
      maxInputTokens: utils.getConfNumber('openai.model.context-widows', 200000),
      maxOutputTokens: utils.getConfNumber('openai.model.max-output-tokens', 100000)
    };
    const regModel = openAIModelProvider.registerLanguageModel(client, modelMetadata.name, modelMetadata);
    context.subscriptions.push(regModel);
  }

  const registeredModels = (await vscode.lm.selectChatModels());
  if (registeredModels.length === 1)
    selectedModel = registeredModels[0];
}

async function selectModelCallback() {
  const models = (await vscode.lm.selectChatModels());

  function _modelQuickPickItemDetail(model: vscode.LanguageModelChat) {
    const details = [];
  
    if (model.family) details.push(`family: ${model.family}`);
    if (model.version) details.push(`version: ${model.version}`);
    if (model.vendor) details.push(`vendor: ${model.vendor}`);
  
    return details.join(', ');
  }

  const quickPickItems = models
    .toSorted((model1, model2) => {
      if (model1 === selectedModel) return -1;
      if (model2 === selectedModel) return 1;
      return 0; })
    .map(model => ({
      id: model.id,
      label: `$(sparkle) ${model.name}`,
      description: model === selectedModel ? 'Selected' : undefined,
      detail: _modelQuickPickItemDetail(model) }));

  const result = await vscode.window.showQuickPick(quickPickItems);
  if (result)
    selectedModel = (await vscode.lm.selectChatModels({ id: result.id }))[0];
}

function helloWorldCallback() {
  vscode.window.showInformationMessage('Hello World from Rocq coding assistant!');
}

async function solveCallback() {
  while (!selectedModel) 
    await vscode.commands.executeCommand('rocq-coding-assistant.select-model');

  if (!coqLSPClient) return Promise.reject('Coq LSP client not started');

  const editor = vscode.window.activeTextEditor;
  if (!editor || !coqTokenizer) return;

  const text = editor.document.getText();
  const tokenizedText = await coqTokenizer.tokenize(text, 'source.coq.proof');
  const splittedText = text.split(/\r?\n|\r|\n/g);

  const proof = extractors.extractProofAtPosition(editor.document.uri.toString(), editor.selection.active, splittedText, tokenizedText);
  if (proof === undefined) { 
    vscode.window.showErrorMessage('Not in a theorem'); 
    return; 
  }

  search(proof, coqLSPClient, [basicLLM.create(selectedModel)]);
}

export async function activate(context: vscode.ExtensionContext) {
  coqLSPClient = cpqLSP.create();
  coqLSPClient.start();

  registerLanguageModels(context);

  coqTokenizer = tokenizer.create(
    context.asAbsolutePath('./node_modules/vscode-oniguruma/release/onig.wasm'),
    [{ path: context.asAbsolutePath('./src/syntax/syntaxes/coq-proof.json'), scopeName: 'source.coq.proof' }]
  );

  const regHelloWorld = vscode.commands.registerCommand(commands.HELLO_WORLD, helloWorldCallback);
  context.subscriptions.push(regHelloWorld);

  const regSelectModel = vscode.commands.registerCommand(commands.SELECT_MODEL, selectModelCallback);
  context.subscriptions.push(regSelectModel);

  const regSolve = vscode.commands.registerCommand(commands.SOLVE, solveCallback);
  context.subscriptions.push(regSolve);
}

export function deactivate() {
  if (coqLSPClient && coqLSPClient.isRunning()) 
    coqLSPClient.dispose();
}
