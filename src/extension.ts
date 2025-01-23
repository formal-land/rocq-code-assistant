import * as vscode from 'vscode';

import {
  CoqLSPClient
} from './coq-lsp-client';

export function activate(context: vscode.ExtensionContext) {

  CoqLSPClient.init().then(
    () => console.log('Coq-LSP client started successfully'),
    (error) => console.log(`Coq-LSP client encountered an error while starting: ${error}`)
  );
  const disposable = vscode.commands.registerCommand('rocq-coding-assistant.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Rocq coding assistant!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  CoqLSPClient.stop().then(
    () => console.log('Coq-LSP client stopped succesfully'),
    (error) => (`Coq-LSP client enocuntered an error while stopping: ${error}`)
  );
}
