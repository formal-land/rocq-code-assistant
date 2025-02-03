import * as vscode from 'vscode';

export interface Proof {
  keyword: string,
  name: string,
  type: string,
  body: string
}

export interface ProofMeta extends Proof {
  location: vscode.Range,
  admitsLocations: vscode.Range[]
}
