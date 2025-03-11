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

export class CoqLSPClient extends LanguageClient {
  private static instance?: CoqLSPClient;

  static get() {
    if (!this.instance) this.instance = new CoqLSPClient;
    return this.instance;
  }
  private constructor() {
    const clientOptions = { documentSelector: CoqSelector.owned };
    const serverOptions = { command: utils.getConfString('coq-lsp-path', 'coq-lsp') };
    super(
      'rocq-coding-assistant-client',
      'Rocq coding assistant client',
      serverOptions,
      clientOptions
    );
  }
}