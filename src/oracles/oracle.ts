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

  parseResponse(response: string) {
    let coqCode = [...response.matchAll(/```coq(?<coqCode>[\s\S]*?)```/gm)][0].groups?.coqCode;
    if (!coqCode) return null;

    const proofBlockRegexRes = coqCode.match(/Proof\.(?<tactics>[\s\S]*)Qed\./m)?.groups;
    if (proofBlockRegexRes) // Response in Proof. ... Qed. block
      coqCode = proofBlockRegexRes.tactics;

    const qedRegexRes = coqCode.match(/(?<tactics>[\s\S]*)Qed\./m)?.groups;
    if (qedRegexRes) // Response ends in Qed.
      coqCode = qedRegexRes.tactics;

    return coqCode;
  }
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