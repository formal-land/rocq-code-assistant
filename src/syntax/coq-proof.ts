import * as vscode from 'vscode';

export namespace Proof {
  export interface Meta {
    keyword: string,
    name: string,
    type: string,
    body: Token[],
    location: vscode.Range,
    admitsLocations: vscode.Range[]
  }

  export class Token {
    text: string;
    tags: string[];

    constructor(text: string, tags: string[]) {
      this.text = text;
      this.tags = tags;
    }
  }
}