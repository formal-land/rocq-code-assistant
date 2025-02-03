import * as utils from './utils';
import { RequestType, LanguageClient } from 'vscode-languageclient/node';
import { CoqSelector } from './lib/coq-lsp/config';
import { GoalRequest, GoalAnswer, PpString } from './lib/coq-lsp/types';

export const goalReq = new RequestType<GoalRequest, GoalAnswer<PpString>, void>(
  'proof/goals'
);

export function create() { 
  const clientOptions = {
    documentSelector: CoqSelector.owned
  };
  
  const serverOptions = {
    command: utils.getConfString('coq-lsp-path', 'coq-lsp')
  };
  
  return new LanguageClient(
    'rocq-coding-assistant-client',
    'Rocq coding assistant client',
    serverOptions,
    clientOptions
  );
}