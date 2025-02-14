import * as vscode from 'vscode';
import { Stack } from '../utils';
import { LanguageClient } from 'vscode-languageclient/node';
import { Request } from '../coq-lsp-client';
import { Goal, PetState, PpString } from '../lib/coq-lsp/types';

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

export interface CheckInfo { 
  status: boolean, 
  message?: string, 
  goal?: Goal<PpString>, 
  state: PetState 
}

export class ProofBlock {
  readonly content: ProofElement[] = [];
  readonly focusingToken: FocusingTokenOpen;
  private lastCheckedIdx;

  constructor(focusingToken: FocusingTokenOpen, lastCheckedIdx?: number) {
    this.focusingToken = focusingToken;
    this.lastCheckedIdx = lastCheckedIdx ? lastCheckedIdx : -1;
  }

  add(element: ProofElement) {
    this.content.push(element);
  }

  nextToCheck() {
    if (this.size() > this.lastCheckedIdx + 1)
      return this.content[this.lastCheckedIdx + 1];
  }

  size() {
    return this.content.length;
  }

  nextChecked() {
    this.lastCheckedIdx++;
  }
  
  getLastCheckedIdx() {
    return this.lastCheckedIdx;
  }
}

export class ProofMeta {
  readonly uri: string;
  readonly keyword: string;
  readonly name: string;
  readonly type: string;
  private body: ProofBlock;
  readonly location: vscode.Range;
  readonly admitsLocations: vscode.Range[];
  private checkStack: Stack<ProofBlock>;

  constructor(uri: string, keyword: string, name: string, type: string, location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = new ProofBlock('{');
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
    this.checkStack = new Stack();

    this.checkStack.push(this.body);
  }

  insert(tokens: ProofToken[]) {
    const insertStack = new Stack<ProofBlock>;
    this.checkStack.items.forEach(block => insertStack.push(block));

    tokens.forEach(({ value, tags }) => {
      if (tags.includes('meta.proof.body.focus.coq')) {
        if (['-', '+', '*', '}'].includes(value)) {
          const focusingTokens = insertStack.items.map(block => block.focusingToken);
          const lastScopeBlockIdx = focusingTokens.lastIndexOf('{');
          const openingTokenIdx = focusingTokens.lastIndexOf(_openingToken(<FocusingTokenClose>value));
          
          if (openingTokenIdx >= lastScopeBlockIdx)
            while (insertStack.size() > 1 && insertStack.size() > openingTokenIdx) 
              insertStack.pop();
        }
        if (['-', '+', '*', '{'].includes(value)) {
          const subBlock = new ProofBlock(<FocusingTokenOpen>value);
          insertStack.peek()?.add(subBlock);
          insertStack.push(subBlock);
        }
      } else if (!tags.includes('meta.proof.body.tactic.admit.coq')) {
        insertStack.peek()?.add({ value, tags });
      }
    });
  }

  async check(coqLSPClient: LanguageClient, state: PetState) {
    let currBlock, nextElement, checkInfo: CheckInfo = { status: true, state: state };
    
    while (checkInfo.status && (currBlock = this.checkStack.peek()) && (nextElement = currBlock.nextToCheck())) {
      if (nextElement instanceof ProofBlock) {
        this.checkStack.push(nextElement);
      } else try {
        checkInfo.state = await coqLSPClient.sendRequest(Request.Petanque.run, { st: state.st, tac: nextElement.value });     
      } catch (error: any) {
        checkInfo.status = false;
        checkInfo.message = error;
      }
      currBlock.nextChecked();
    }

    const goalConf = await coqLSPClient.sendRequest(Request.Petanque.goals, { st: state.st });
    if (goalConf.goals.length === 0) this.checkStack.pop();
    else checkInfo.goal = goalConf.goals[0];
    
    return checkInfo;
  }

  copy() {
    const copy = new ProofMeta(this.uri, this.keyword, this.name, this.type, this.location, this.admitsLocations);
    ({ proofBlock: copy.body, checkStack: copy.checkStack } = this._copyOthers(this.body, this.checkStack));
    return copy;
  }

  private _copyOthers(proofBlock: ProofBlock, checkStack: Stack<ProofBlock>) {
    const proofBlockCopy = new ProofBlock(proofBlock.focusingToken, proofBlock.getLastCheckedIdx());
    const checkStackCopy = new Stack<ProofBlock>();

    if (this.checkStack.items.includes(proofBlock)) checkStackCopy.push(proofBlockCopy);

    for (const element of proofBlock.content) {
      if (element instanceof ProofBlock) {
        const { proofBlock: subProofBlockCopy, checkStack: subCheckStackCopy } = this._copyOthers(element, checkStack);
        proofBlockCopy.add(subProofBlockCopy);
        checkStackCopy.merge(subCheckStackCopy);
      } else {
        proofBlockCopy.add(element);
      }
    }
    
    return { proofBlock: proofBlockCopy, checkStack: checkStackCopy };
  }
}