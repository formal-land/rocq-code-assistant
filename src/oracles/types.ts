import * as vscode from 'vscode';
import { Goal, PpString } from '../lib/coq-lsp/types';
import { Token } from '../syntax/tokenizer';

export interface Oracle {
  query(goal: Goal<PpString>, params?: OracleParams, cancellationToken?: vscode.CancellationToken): Promise<string>
}

export interface OracleParams {
  errorHistory?: { tactics: Token[], message?: string }[]
}