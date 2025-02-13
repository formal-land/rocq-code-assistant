import * as vscode from 'vscode';
import { Stack } from '../utils';
import { LanguageClient } from 'vscode-languageclient/node';
import { Request } from '../coq-lsp-client';
import { PetState } from '../lib/coq-lsp/types';

export type FocusingTokenOpen = '-'|'+'|'*'|'{';
export type FocusingTokenClose = '-'|'+'|'*'|'}';

function _openingToken(construct: FocusingTokenClose): FocusingTokenOpen {
  switch (construct) {
    case '-': return '-';
    case '+': return '+';
    case '*': return '*';
    case '}': return '{';
  }
}

export interface ProofToken {
  value: string,
  tags: string[]
}

export type ProofElement = ProofBlock | ProofToken;

export class ProofBlock {
  private content: ProofElement[] = [];
  readonly focusingToken: FocusingTokenOpen;

  constructor(focusingToken?: FocusingTokenOpen) {
    this.focusingToken = focusingToken ? focusingToken : '{';
  }

  addElement(element: ProofElement) {
    this.content.push(element);
  }

  getElement(idx: number) {
    return this.content[idx];
  }

  size() {
    return this.content.length;
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
    this.checkStack.push({ block: this.body, lastCheckedIdx: -1 });
  }

  insert(tokens: ProofToken[]) {
    const insertStack = new Stack<ProofBlock>;
    this.checkStack.content().forEach(({ block, }) => insertStack.push(block));

    tokens.forEach(({ value, tags }) => {
      if (tags.includes('meta.proof.body.focus.coq')) {
        if (['-', '+', '*', '}'].includes(value)) {
          const focusingTokens = insertStack.content().map(block => block.focusingToken);
          const lastScopeBlockIdx = focusingTokens.lastIndexOf('{');
          const openingTokenIdx = focusingTokens.lastIndexOf(_openingToken(<FocusingTokenClose>value));
          
          if (openingTokenIdx >= lastScopeBlockIdx)
            while (insertStack.size() > 1 && insertStack.size() > openingTokenIdx) 
              insertStack.pop();
        }
        if (['-', '+', '*', '{'].includes(value)) {
          const subBlock = new ProofBlock(<FocusingTokenOpen>value);
          insertStack.peek()?.addElement(subBlock);
          insertStack.push(subBlock);
        }
      } else if (!tags.includes('meta.proof.body.tactic.admit.coq')) {
        insertStack.peek()?.addElement({ value, tags });
      }
    });
  }

  async check(coqLSPClient: LanguageClient, state: PetState) {
    let currBlock;
    let goalConf;
    while ((currBlock = this.checkStack.peek()) && currBlock.block.size() > currBlock.lastCheckedIdx + 1) {
      let element = currBlock.block.getElement(currBlock.lastCheckedIdx + 1);
      if (element instanceof ProofBlock) {
        this.checkStack.push({ block: element, lastCheckedIdx: -1 });
      } else {
        state = await coqLSPClient.sendRequest(Request.Petanque.run, { st: state.st, tac: element.value });
        goalConf = await coqLSPClient.sendRequest(Request.Petanque.goals, { st: state.st });
        if (goalConf.goals.length === 0)
          this.checkStack.pop();
      }
      currBlock.lastCheckedIdx++;
    }
    return { goal: goalConf?.goals[0], state: state };
  }
}