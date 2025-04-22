import * as vscode from 'vscode';
import { Goal, PpString } from '../lib/coq-lsp/types';
import { Token } from '../syntax/tokenizer';
import { Model } from './model';
import { Comment } from '../proof/comment';

export abstract class Oracle {
  protected model: Model;

  constructor(model: vscode.LanguageModelChat) {
    this.model = new Model(model);
  }

  abstract query(goal: Goal<PpString>, params: Oracle.Params, cancellationToken?: vscode.CancellationToken): Promise<Oracle.Repairable>
}

export namespace Oracle {
  export interface Params {
    comment?: Comment
  }

  export interface Error {
    at: number,
    message?: string
  }

  export interface Repairable {
    response: Token[],
    repair(error: Oracle.Error): Promise<Oracle.Repairable>
  }
}