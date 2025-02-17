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

let coqLSPClient: LanguageClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
  coqLSPClient = cpqLSP.create();
  coqLSPClient.start();

  const isOllamaEnabled = false; //utils.getConfBoolean('ollama-enabled', false);
  if (isOllamaEnabled) {
    // TODO: what if ollama is enabled after that the extension is run?
    const ollamaHostAddress = utils.getConfString('ollama-host-address', '172.28.176.1');
    const ollamaHostPort = utils.getConfString('ollama-host-port', '11434');
    const ollamaHost = `http://${ollamaHostAddress}:${ollamaHostPort}`;
  
    const ollamaClient = ollamaModelProvider.init(ollamaHost);
    console.log('Ollama client started');
    
    const localModels = (await ollamaClient.list()).models; 
    localModels.forEach(model => {
      // TODO: set a more informative maxInputTokens and maxOutputTokens
      const regModel = ollamaModelProvider.registerLanguageModel(ollamaClient, model, 1000, 1000);
      context.subscriptions.push(regModel);
      console.log(`Ollama model ${model.name} registered`);
    });
  }

  const isOpenAIEnabled = false;
  if (isOpenAIEnabled) {
    const openAIClient = openAIModelProvider.init();
    const modelMetadata: vscode.ChatResponseProviderMetadata = {
      name: 'gpt-4o-mini',
      vendor: 'OpenAI',
      family: 'gpt',
      version: '',
      maxInputTokens: 128000,
      maxOutputTokens: 16384
    };
    openAIModelProvider.registerLanguageModel(openAIClient, 'gpt-4o-mini', modelMetadata);
  }

  const coqTokenizer = tokenizer.create(
    context.asAbsolutePath('./node_modules/vscode-oniguruma/release/onig.wasm'),
    [
      { path: context.asAbsolutePath('./src/syntax/syntaxes/coq.json'), scopeName: 'source.coq' },
      { path: context.asAbsolutePath('./src/syntax/syntaxes/coq-proof.json'), scopeName: 'source.coq.proof' }
    ]
  );

  const regHelloWorld = vscode.commands.registerCommand('rocq-coding-assistant.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Rocq coding assistant!');
  });
  context.subscriptions.push(regHelloWorld);

  const regSolve = vscode.commands.registerCommand('rocq-coding-assistant.solve', async () => {
    if (!coqLSPClient) return Promise.reject('Coq LSP client not started');

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const text = editor.document.getText();
    const tokenizedText = await coqTokenizer.tokenize(text, 'source.coq.proof');
    const splittedText = text.split(/\r?\n|\r|\n/g);

    const proof = extractors.extractProofAtPosition(editor.document.uri.toString(), editor.selection.active, splittedText, tokenizedText);
    if (proof === undefined) { 
      vscode.window.showErrorMessage('Not in a theorem'); 
      return; 
    }

    const [model] = await vscode.lm.selectChatModels({ vendor: 'ollama' });
    const oracle = basicLLM.create(model);

    search(proof, coqLSPClient, [oracle]);
  });
  context.subscriptions.push(regSolve);
}

export function deactivate() {
  if (coqLSPClient && coqLSPClient.isRunning()) 
    coqLSPClient.dispose();
}
