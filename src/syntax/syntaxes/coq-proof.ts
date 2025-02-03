import * as vscode from 'vscode';

export interface Proof {
  name: string,
  type: string,
  body: string
}

export interface ProofMeta extends Proof {
  admits: vscode.Range[]
}
