import * as vscode from 'vscode';
import { CoqLSPClient } from './coq-lsp-client';
import { Request } from './coq-lsp-client';
import { PetState } from './lib/coq-lsp/types';
import { Token } from './syntax/tokenizer';
import { Oracle } from './oracles/types';
import { Tokenizer } from './syntax/tokenizer';
import { Scope, Name } from './syntax/scope';

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

  async insert(tokens: Token[], execute: boolean = true, cancellationToken?: vscode.CancellationToken) {
    if (!this.open) throw Error('Proof completed');

    const baseLineIdx = tokens[0].range.start.line;

    for (const token of tokens) {
      let nextElement;
      if (token.scopes.includes(Name.ADMIT))
        nextElement = new ProofBlock(this.state);
      else
        nextElement = { ...token, range: new vscode.Range(token.range.start.translate(-baseLineIdx), token.range.end.translate(-baseLineIdx))};
    
      if (execute && token.scopes.includes(Name.EXECUTABLE)) {
        this.state = await CoqLSPClient
          .get()
          .sendRequest(Request.Petanque.run, { st: this.state.st, tac: token.value.trim() }, cancellationToken);
      }
      
      this.elements.push(nextElement);
    }

    const goals = await this.goals(cancellationToken);
    if (goals.length === 0) this.open = false;
  }

  async goals(cancellationToken?: vscode.CancellationToken) {
    const goals = await CoqLSPClient
      .get()
      .sendRequest(Request.Petanque.goals, { st: this.state.st }, cancellationToken);
    return goals.goals;
  }

  deepcopy(): ProofBlock {
    const copy = new ProofBlock(this.state);
    copy.open = this.open;
    copy.elements = this.elements.map(element => 
      element instanceof ProofBlock ? element.deepcopy() : element);
    return copy;
  }

  toString(): string {
    return this.elements
      .map(element => element instanceof ProofBlock ? element.toString() : element.value)
      .join(' ');
  }
}

export class ProofMeta {
  readonly uri: string;
  readonly keyword: string;
  readonly name: string;
  readonly type: string;
  readonly body: ProofBlock;
  readonly editorLocation: vscode.Range;

  private constructor(uri: string, keyword: string, name: string, type: string, body: ProofBlock, editorLocation: vscode.Range) {
    this.keyword = keyword;
    this.name = name;
    this.type = type;
    this.body = body;
    this.uri = uri;
    this.editorLocation = editorLocation;
  }

  private static async init(uri: string, keyword: string, name: string, type: string, location: vscode.Range, body?: Token[], cancellationToken?: vscode.CancellationToken) {
    const startingState = await CoqLSPClient
      .get()
      .sendRequest(Request.Petanque.start, { uri: uri, thm: name, pre_commands: null }, cancellationToken);
    const proofMeta = new ProofMeta(uri, keyword, name, type, new ProofBlock(startingState), location);
    if (body) await proofMeta.insert(body, cancellationToken);
    return proofMeta;
  }

  static fromTokens(uri: string, tokens: Token[], cancellationToken?: vscode.CancellationToken) {  
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
    
    const bodyTokens = tokens
      .filter(token => token.scopes.includes(Name.PROOF_BODY));
    
    const location = new vscode.Range(
      tokens[0].range.start.line, 
      tokens[0].range.start.character, 
      tokens[tokens.length - 1].range.end.line, 
      tokens[tokens.length - 1].range.end.character);
      
    return ProofMeta.init(uri, keyword, name, type, location, bodyTokens, cancellationToken);
  }

  async insert(tokens: Token[], cancellationToken?: vscode.CancellationToken, at: number = 0, execute: boolean = true) {
    const openSubProofs = this.body.openSubProofs();
    if (openSubProofs.length > at)
      await openSubProofs[at].insert(tokens, execute, cancellationToken);
    else throw Error('Index too large');
  }

  async goals(cancellationToken?: vscode.CancellationToken) {
    const goals = await Promise.all(this.body
      .openSubProofs()
      .map(openSubProof => openSubProof.goals(cancellationToken)));
    return goals.flat();
  }

  async fill(oracles: Oracle[], cancellationToken?: vscode.CancellationToken) {
    const goals = await this.goals();

    await Promise.all(
      goals.map(async (goal, idx) => {
        const answer = await oracles[0].query(goal, cancellationToken);
        const tactics = await Tokenizer.get().tokenize(answer, Scope.PROOF_BODY);
        return this.insert(tactics, cancellationToken, idx, false);
      })
    );

    return this;
  }

  deepcopy() {
    return new ProofMeta(this.uri, this.keyword, this.name, this.type, this.body.deepcopy(), this.editorLocation);
  }

  toString() {
    return `${this.keyword} ${this.name}: ${this.type}. Proof. ${this.body.toString()} Qed.`;
  }
}