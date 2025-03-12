import * as vscode from 'vscode';
import { CoqLSPClient } from './coq-lsp-client';
import { Request } from './coq-lsp-client';
import { PetState } from './lib/coq-lsp/types';
import { Name } from './syntax/scope';
import { Token } from './syntax/tokenizer';

class ProofBlock {
  private state: PetState;
  private open: boolean = true;
  private elements: (ProofBlock | Token)[] = [];

  constructor(state: PetState) {
    this.state = state;
  }

  openSubProofs(): ProofBlock[] {
    const openSubProofs = this.elements.flatMap(element =>
      element instanceof ProofBlock ? element.openSubProofs() : []);

    if (this.open) openSubProofs.push(this);
    
    return openSubProofs;
  }

  async insert(tokens: Token[], execute: boolean = true) {
    if (!this.open) throw Error('Proof completed');

    for (const token of tokens) {
      const nextElement = token.scopes.includes(Name.ADMIT) ? new ProofBlock(this.state) : token;
      if (execute && token.scopes.includes(Name.EXECUTABLE))
        this.state = await CoqLSPClient
          .get()
          .sendRequest(Request.Petanque.run, { st: this.state.st, tac: token.value });
      this.elements.push(nextElement);
    }

    const goals = await this.goals();
    if (goals.length === 0) this.open = false;
  }

  async goals() {
    const goals = await CoqLSPClient
      .get()
      .sendRequest(Request.Petanque.goals, { st: this.state.st });
    return goals.goals;
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

  private constructor(uri: string, keyword: string, name: string, type: string, body: ProofBlock, location: vscode.Range, admitsLocations: vscode.Range[]) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = body;
    this.uri = uri;
    this.location = location;
    this.admitsLocations = admitsLocations;
  }

  private static async init(uri: string, keyword: string, name: string, type: string, location: vscode.Range, admitsLocations: vscode.Range[], body?: Token[]) {
    const startingState = await CoqLSPClient
      .get()
      .sendRequest(Request.Petanque.start, { uri: uri, thm: name, pre_commands: null });
    const proofMeta = new ProofMeta(uri, keyword, name, type, new ProofBlock(startingState), location, admitsLocations);
    if (body) await proofMeta.insert(body);
    return proofMeta;
  }

  static fromTokens(uri: string, tokens: Token[]) {  
    const keyword = tokens
      .filter(token => token.scopes.includes(Name.PROOF_TOKEN))
      .map(token => token.value)
      .join(' ');
    
    const name = tokens
      .filter(token => token.scopes.includes(Name.PROOF_NAME))
      .map(token => token.value)
      .join(' ');
    
    const type = tokens
      .filter(token => token.scopes.includes(Name.PROOF_TYPE))
      .map(token => token.value)
      .join(' ');
    
    const body = tokens
      .filter(token => token.scopes.includes(Name.PROOF_BODY));
    
    const location = new vscode.Range(
      tokens[0].range.start.line, 
      tokens[0].range.start.character, 
      tokens[tokens.length - 1].range.end.line, 
      tokens[tokens.length - 1].range.end.character);
    
    const admitsLocations = tokens
      .filter(token => 
        token.scopes.includes(Name.ADMIT))
      .map(token => token.range);
      
    return ProofMeta.init(uri, keyword, name, type, location, admitsLocations, body);
  }

  async insert(tokens: Token[], at: number = 0, execute: boolean = true) {
    const openSubProofs = this.body.openSubProofs();
    if (openSubProofs.length > at)
      await openSubProofs[at].insert(tokens, execute);
    else throw Error('Index too large');
  }

  async goals() {
    const goals = await Promise.all(this.body
      .openSubProofs()
      .map(openSubProof => openSubProof.goals()));
    return goals.flat();
  }

  deepcopy() {
    return new ProofMeta(this.uri, this.keyword, this.name, this.type, this.body.deepcopy(), this.location, this.admitsLocations);
  }
}