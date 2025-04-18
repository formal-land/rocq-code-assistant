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
    errorHistory?: { 
      tactics: Token[],
      at: number,
      message?: string }[],
    comment?: Comment
  }

  export interface Repairable {
    response: string[],
    repair(params: Oracle.Params): Promise<Oracle.Repairable>
  }
}