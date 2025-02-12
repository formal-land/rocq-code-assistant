import * as vscode from 'vscode';

export type Proof = string[];

export class ProofMeta {
  keyword: string;
  name: string;
  type: string;
  body: { token: string, tags: string[] }[];
  uri: string;
  location: vscode.Range;
  admitsLocations: vscode.Range[];

  constructor(keyword: string, name: string, type: string, body: { token: string, tags: string[] }[], 
    uri: string, location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = body;
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
  }

  toProof(): Proof {
    return this.body.map(({token, }) => token);
  }
}