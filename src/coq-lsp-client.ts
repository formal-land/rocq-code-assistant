import * as utils from './utils';
import { 
  RequestType, 
  LanguageClient 
} from 'vscode-languageclient/node';
import { CoqSelector } from './lib/coq-lsp/config';
import { 
  GoalRequest, 
  GoalAnswer, 
  PpString, 
  PetStartParams, 
  PetRunParams,
  PetGoalParams,
  PetRunAnswer,
  PetStartAnswer, 
  GoalConfig
} from './lib/coq-lsp/types';

export namespace Request {
  export const goals = new RequestType<GoalRequest, GoalAnswer<PpString>, void>('proof/goals');

  export namespace Petanque {
    export const start = new RequestType<PetStartParams, PetStartAnswer, void>('petanque/start');
    export const goals = new RequestType<PetGoalParams, GoalConfig<PpString>, void>('petanque/goals');
    export const run = new RequestType<PetRunParams, PetRunAnswer, void>('petanque/run');
  }
}

let client: LanguageClient | undefined;

export function get() { 
  if (!client) {
    const clientOptions = { documentSelector: CoqSelector.owned };
  
    const serverOptions = { command: utils.getConfString('coq-lsp-path', 'coq-lsp') };
  
    client = new LanguageClient(
      'rocq-coding-assistant-client',
      'Rocq coding assistant client',
      serverOptions,
      clientOptions
    );
  }

  return client;
}