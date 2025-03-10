import * as vscode from 'vscode';
import * as coqLSP from '../coq-lsp-client';
import { Request } from '../coq-lsp-client';
import { PetState } from '../lib/coq-lsp/types';

export interface ProofToken {
  value: string,
  tags: string[]
}

type ProofElement = ProofBlock | ProofToken;

export class ProofBlock {
  private state: PetState;
  private open: boolean = true;
  private elements: ProofElement[] = [];

  constructor(state: PetState) {
    this.state = state;
  }

  openSubProofs(): ProofBlock[] {
    const openSubProofs = this.elements.flatMap(element =>
      element instanceof ProofBlock ? element.openSubProofs() : []);

    if (this.open)
      openSubProofs.push(this);
    
    return openSubProofs;
  }

  async insert(tokens: ProofToken[]) {
    if (!this.open) throw Error('Proof completed');

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
  readonly body: ProofBlock;
  readonly location: vscode.Range;
  readonly admitsLocations: vscode.Range[];

  static async init(uri: string, keyword: string, name: string, type: string, location: vscode.Range, admitsLocations: vscode.Range[]) {
    const startingState = await coqLSP
      .get()
      .sendRequest(Request.Petanque.start, { uri: uri, thm: name, pre_commands: null });
    return new ProofMeta(uri, keyword, name, type, new ProofBlock(startingState), location, admitsLocations);
  }
  
  private constructor(uri: string, keyword: string, name: string, type: string, body: ProofBlock, location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = body;
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
  }

  deepcopy() {
    return new ProofMeta(this.uri, this.keyword, this.name, this.type, this.body.deepcopy(), this.location, this.admitsLocations);
  }
}