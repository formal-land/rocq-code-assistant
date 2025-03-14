import * as vscode from 'vscode';
import { Goal, PpString } from '../lib/coq-lsp/types';

export interface Oracle {
  query(goal: Goal<PpString>, cancellationToken?: vscode.CancellationToken): Promise<string>
}