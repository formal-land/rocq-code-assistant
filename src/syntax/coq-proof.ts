import * as vscode from 'vscode';
import { Stack } from '../utils';
import { LanguageClient } from 'vscode-languageclient/node';

export type Proof = string[];

export type FocusingToken = '-'|'+'|'*'|'{';

export interface ProofToken {
  value: string,
  tags: string[]
}

export type ProofElement = ProofBlock | ProofToken;

export class ProofBlock {
  content: ProofElement[] = [];
  focusingToken: FocusingToken;

  constructor(focusingToken?: FocusingToken) {
    this.focusingToken = focusingToken ? focusingToken : '{';
    
  }

  // TODO: not putting focusing token!
  toProof(): Proof {
    return this.content
      .map(item => item instanceof ProofBlock ? item.toProof() : [item.value])
      .reduce((proof, item) => proof.concat(item));
  }
}

export class ProofMeta {
  readonly keyword: string;
  readonly name: string;
  readonly type: string;
  private body: ProofBlock;
  readonly uri: string;
  readonly location: vscode.Range;
  readonly admitsLocations: vscode.Range[];
  private checkStack: Stack<{ block: ProofBlock, lastCheckedIdx: number }>;

  constructor(keyword: string, name: string, type: string, uri: string, 
    location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = new ProofBlock();
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
    this.checkStack = new Stack();
    this.checkStack.push({ block: this.body, lastCheckedIdx: 0 });
  }

  insert(tokens: ProofToken[]) {
    const insertStack = new Stack<ProofBlock>;
    this.checkStack.content().forEach(({ block, }) => insertStack.push(block));

    function _openingToken(construct: string): FocusingToken {
      switch (construct) {
        case '-': return '-';
        case '+': return '+';
        case '*': return '*';
        case '}': return '{';
        default: return '{';
      }
    }

    tokens.forEach(token => {
      if (token.tags.includes('meta.proof.body.focus.coq')) {
        if (['-', '+', '*', '}'].includes(token.value)) {
          const focusingTokens = insertStack.content().map(block => block.focusingToken);
          const lastScopeBlockIdx = focusingTokens.lastIndexOf('{');
          const openingTokenIdx = focusingTokens.lastIndexOf(_openingToken(token.value));
          
          if (openingTokenIdx >= lastScopeBlockIdx)
            while (insertStack.size() > 1 && insertStack.size() > openingTokenIdx) 
              insertStack.pop();
        }
        if (['-', '+', '*', '{'].includes(token.value)) {
          const subBlock = new ProofBlock(<FocusingToken>token.value);
          insertStack.peek()?.content.push(subBlock);
          insertStack.push(subBlock);
        }
      } else {
        insertStack.peek()?.content.push(token);
      }
    });
  }

  check(coqLSPClient: LanguageClient, state: number) {

  }

  toProof(): Proof {
    return this.body.toProof();
  }
}