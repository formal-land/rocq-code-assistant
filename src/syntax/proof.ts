import * as vscode from 'vscode';
import * as coqLSP from '../coq-lsp-client';
import { Request } from '../coq-lsp-client';
import { PetState } from '../lib/coq-lsp/types';

export interface ProofToken {
  value: string,
  tags: string[]
}

type ProofElement = ProofBlock | ProofToken;

class ProofBlock {
  state: PetState;
  open: boolean = true;
  elements: ProofElement[] = [];

  constructor(state: PetState) {
    this.state = state;
  }

  subBlocks(openOnly: boolean = false): ProofBlock[] {
    const openSP = this.elements.flatMap(element =>
      element instanceof ProofBlock ? element.subBlocks() : []);

    if (!openOnly || (openOnly && this.open))
      openSP.push(this);
    
    return openSP;
  }

  async insert(tokens: ProofToken[]) {
    for (const token of tokens) {
      const nextElement = token.tags.includes('meta.proof.body.tactic.admit.coq') ?
        new ProofBlock(this.state) : token;
      this.state = await coqLSP
        .get()
        .sendRequest(Request.Petanque.run, { st: this.state.st, tac: token.value });
      this.elements.push(nextElement);
    }

    const goals = await coqLSP
      .get()
      .sendRequest(Request.Petanque.goals, { st: this.state.st });
    if (goals.goals.length === 0)
      this.open = false;
  }

  async goal() {
    const goals = await coqLSP
      .get()
      .sendRequest(Request.Petanque.goals, { st: this.state.st });
    return goals.goals[0];
  }

  deepcopy(): ProofBlock {
    const copy = new ProofBlock(this.state);
    copy.open = this.open;
    copy.elements = this.elements.map(element => 
      element instanceof ProofBlock ? element.deepcopy() : element);
    return copy;
  }
}

export class ProofMeta {
  readonly uri: string;
  readonly keyword: string;
  readonly name: string;
  readonly type: string;
  private body?: ProofBlock;
  readonly location: vscode.Range;
  readonly admitsLocations: vscode.Range[];

  constructor(uri: string, keyword: string, name: string, type: string, location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
  }

  async insert(tokens: ProofToken[]) {
    if (!this.body) {
      const sState = await coqLSP
        .get()
        .sendRequest(Request.Petanque.start, { uri: this.uri, thm: this.name, pre_commands: null });
      this.body = new ProofBlock(sState);
    }
    if (!this.body.state.proof_finished)
      await this.body.subBlocks(true)[0].insert(tokens);

    console.log('aaa');
  }

  deepcopy() {
    const copy = new ProofMeta(this.uri, this.keyword, this.name, this.type, this.location, this.admitsLocations);
    copy.body = this.body?.deepcopy();
    return copy;
  }
}