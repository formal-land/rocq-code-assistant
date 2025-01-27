import * as vscode from 'vscode';

import {
  CoqLSPClient
} from './coq-lsp-client';

import {
  OllamaModelProvider
} from './model-providers/ollama';

export function activate(context: vscode.ExtensionContext) {

  CoqLSPClient.init().then(
    () => console.log('Coq-LSP client started successfully'),
    (error) => console.log(`Coq-LSP client encountered an error while starting: ${error}`)
  );

  if (true) {
    const regOllamaModelProvider = OllamaModelProvider.init('gemma', '2b', 'http://localhost:11434/', 100, 100);
    console.log('Ollama model provider registered');
    context.subscriptions.push(regOllamaModelProvider);
  }

  const regHelloWorld = vscode.commands.registerCommand('rocq-coding-assistant.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Rocq coding assistant!');
  });
  context.subscriptions.push(regHelloWorld);

  const regTryOllama = vscode.commands.registerCommand('rocq-coding-assistant.tryOllama', async () => {
    console.log(await vscode.lm.selectChatModels());
    const [model] = await vscode.lm.selectChatModels({ vendor: 'ollama' });
    console.log(model);

    let chatResponse: vscode.LanguageModelChatResponse | undefined;

    const messages = [ vscode.LanguageModelChatMessage.User('What\'s a lambda term?') ];

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
  CoqLSPClient.stop().then(
    () => console.log('Coq-LSP client stopped succesfully'),
    (error) => (`Coq-LSP client enocuntered an error while stopping: ${error}`)
  );
}
