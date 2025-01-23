import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient/node';

import {
  CoqSelector
} from './lib/coq-lsp/config';

import * as utils from './utils';

export namespace CoqLSPClient {
  let client: LanguageClient | undefined;

  export function init() { 
    if (client && client.isRunning()) 
      return Promise.resolve();

    const clientOptions: LanguageClientOptions = {
      documentSelector: CoqSelector.owned
    };
  
    const serverOptions: ServerOptions = {
      command: utils.getConfigurationString('coq-lsp-path', 'coq-lsp')
    };
  
    client = new LanguageClient(
      'rocq-coding-assistant-client',
      'Rocq coding assistant client',
      serverOptions,
      clientOptions
    );
  
    return client.start();
  }

  export function stop() {
    if (client && client.isRunning()) 
      return client.dispose();
    else 
      return Promise.resolve();
  }
}