import * as vscode from 'vscode';
import * as utils from './utils';
import * as tok from './tokenizer';
import { CoqLSPClient } from './coq-lsp-client';
import { OllamaModelProvider } from './model-providers/ollama';


export async function activate(context: vscode.ExtensionContext) {
  try {
    await CoqLSPClient.init();
  } catch (error) {
    console.log(`Coq-LSP client encountered an error while starting: ${error}`);
  }

  const isOllamaEnabled = utils.getConfBoolean('ollama-enabled', true);
  if (isOllamaEnabled) {
    // TODO: what if ollama is enabled after that the extension is run?
    const ollamaHostAddress = utils.getConfString('ollama-host-address', '127.0.0.1');
    const ollamaHostPort = utils.getConfString('ollama-host-port', '11434');
    const ollamaHost = `http://${ollamaHostAddress}:${ollamaHostPort}`;
  
    const ollamaClient = OllamaModelProvider.init(ollamaHost);
    console.log('Ollama client started');
    
    const localModels = (await ollamaClient.list()).models; 
    localModels.forEach(model => {
      // TODO: set a more informative maxInputTokens and maxOutputTokens
      const regModel = OllamaModelProvider.registerLanguageModel(ollamaClient, model, 1000, 1000);
      context.subscriptions.push(regModel);
      console.log(`Ollama model ${model.name} registered`);
    });
  }

  const coqTokenizer = tok.create(
    context.asAbsolutePath('./node_modules/vscode-oniguruma/release/onig.wasm'),
    context.asAbsolutePath('./src/lib/coq-lsp/syntaxes/coq.json'),
    'source.coq'
  );

  const regSolve = vscode.commands.registerCommand('rocq-coding-assistant.solve', async () => {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) return;

    const selection = editor.selection;
    const selectionLine = editor.document.lineAt(selection.anchor.line).text;
    const tokenizedSelectionLine = (await coqTokenizer.tokenize(selectionLine))[0];
    
    const isSelectionTheorem = tokenizedSelectionLine.tokens.some(token => 
      token.startIndex === selection.anchor.character && 
      token.endIndex === selection.end.character && 
      token.scopes.includes('entity.name.function.theorem.coq')
    );

    if (!isSelectionTheorem) {
      vscode.window.showErrorMessage('No theorem selected'); 
      return;
    } else {
      vscode.window.showInformationMessage('Theorem');
    }
  });
  context.subscriptions.push(regSolve);

  const regHelloWorld = vscode.commands.registerCommand('rocq-coding-assistant.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Rocq coding assistant!');
  });
  context.subscriptions.push(regHelloWorld);

  const regTryOllama = vscode.commands.registerCommand('rocq-coding-assistant.tryOllama', async () => {
    console.log(await vscode.lm.selectChatModels());
    const [model] = await vscode.lm.selectChatModels({vendor: 'ollama'});
    console.log(model);

    let chatResponse: vscode.LanguageModelChatResponse | undefined;

    const messages = [vscode.LanguageModelChatMessage.User('What\'s a lambda term?')];

    try {
      chatResponse = await model.sendRequest(
        messages,
        {},
        new vscode.CancellationTokenSource().token
      );
    } catch (err) {
      if (err instanceof vscode.LanguageModelError) 
        console.log('Exception catched', err.message, err.code, err.cause);
      else 
        throw err;
      
      return;
    }

    try {
      // Stream the code into the editor as it is coming in from the Language Model
      for await (const fragment of chatResponse.text) 
        console.log(fragment);
      
    } catch (err) {
      if (err instanceof vscode.LanguageModelError) 
        console.log('Exception catched', err.message, err.code, err.cause);
      else 
        throw err;
      
      return;
    }
  });
  context.subscriptions.push(regTryOllama);
}

export function deactivate() {
  try {
    CoqLSPClient.stop();
    console.log('Coq-LSP client stopped');
  } catch (error) {
    console.error(`Coq-LSP client enocuntered an error while stopping: ${error}`);
  }
}
