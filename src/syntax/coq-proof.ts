import * as vscode from 'vscode';

export type Proof = string[];

export type FocusingToken = '-'|'+'|'*'|'{';

export class ProofBlock {
  content: (ProofBlock | { token: string, tags: string[] })[] = [];
  focusingToken?: FocusingToken;

  constructor(focusingToken?: FocusingToken) {
    this.focusingToken = focusingToken;
  }

  // TODO: not putting focusing token!
  toProof(): Proof {
    return this.content
      .map(item => item instanceof ProofBlock ? item.toProof() : [item.token])
      .reduce((proof, item) => proof.concat(item));
  }
}

export class ProofMeta {
  keyword: string;
  name: string;
  type: string;
  body: ProofBlock;
  uri: string;
  location: vscode.Range;
  admitsLocations: vscode.Range[];

  constructor(keyword: string, name: string, type: string, body: ProofBlock, uri: string, 
    location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = body;
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
  }

  toProof(): Proof {
    return this.body.toProof();
  }
}