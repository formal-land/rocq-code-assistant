import * as vscode from 'vscode';
import * as lsp from 'vscode-languageserver-types';
import { LanguageClient, VersionedTextDocumentIdentifier } from 'vscode-languageclient/node';
import * as utils from './utils';
import * as tokenizer from './syntax/tokenizer';
import * as cpqLSP from './coq-lsp-client';
import * as ollamaModelProvider from './model-providers/ollama';
import * as extractors from './syntax/extractors';
import { GoalRequest } from './lib/coq-lsp/types';
import * as basicLLM from './oracles/basic-LLM/basic-LLM';

let coqLSPClient: LanguageClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
  coqLSPClient = cpqLSP.create();
  coqLSPClient.start();

  const isOllamaEnabled = utils.getConfBoolean('ollama-enabled', true);
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
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) return;

    const text = editor.document.getText();
    const tokenizedText = await coqTokenizer.tokenize(text, 'source.coq.proof');
    const splittedText = text.split(/\r?\n|\r|\n/g);

    const proof = extractors.extractProofAtPosition(editor.selection.active, splittedText, tokenizedText);
    if (proof === undefined) { 
      vscode.window.showErrorMessage('Not in a theorem'); 
      return; 
    }

    const goals = await Promise.all(proof.admitsLocations.map(async (admitsLocation) => {
      const params: GoalRequest = {
        textDocument: VersionedTextDocumentIdentifier.create(editor.document.uri.toString(), editor.document.version),
        position: lsp.Position.create(admitsLocation.start.line, admitsLocation.start.character),
        pp_format: 'Str'
      };

      const goal = await coqLSPClient?.sendRequest(cpqLSP.goalReq, params);

      return goal;
    }));

    const [model] = await vscode.lm.selectChatModels({vendor: 'ollama'});

    const oracle = basicLLM.create(model);

    const goal = goals[0]?.goals?.given_up[0];

    if (goal !== undefined) {
      const response = await oracle.query(goal);
      console.log(response);
    }
  });
  context.subscriptions.push(regSolve);
}

export function deactivate() {
  if (coqLSPClient && coqLSPClient.isRunning()) 
    coqLSPClient.dispose();
}
