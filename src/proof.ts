import * as vscode from 'vscode';
import { CoqLSPClient } from './coq-lsp-client';
import { Request } from './coq-lsp-client';
import { PetState } from './lib/coq-lsp/types';
import { Token } from './syntax/tokenizer';
import { Oracle, OracleParams } from './oracles/types';
import { Tokenizer } from './syntax/tokenizer';
import { Scope, Name } from './syntax/scope';

const MAX_ATTEMPT = 3;

namespace PetState {
  export enum Default { INCONSISTENT }
}

type Element = ProofBlock | Token;

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
    if (body) await proofMeta.insert(body, 0, true, cancellationToken);
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

  async insert(tokens: Token[], at: number, execute: boolean, cancellationToken?: vscode.CancellationToken) {
    const openSubProofs = this.body.openSubProofs();
    if (openSubProofs.length > at)
      return await openSubProofs[at].insert(tokens, execute, cancellationToken);
    else throw Error('Index too large');
  }

  async goals(cancellationToken?: vscode.CancellationToken) {
    const goals = await Promise.all(this.body
      .openSubProofs()
      .map(openSubProof => openSubProof.goals(cancellationToken)));
    return goals.flat();
  }

  async autocomplete(oracles: Oracle[], cancellationToken?: vscode.CancellationToken) {
    const goals = await this.goals();
    const oracle = oracles[0];

    for (const [, goal] of goals.entries()) {
      let res: { status: boolean, message?: string } = { status: false };
      let queriesNum = 0;
      let answers: string[] = [];
      let answer;
      let tactics: Token[] = [];
      const params: OracleParams = {
        errorHistory: []
      };

      while (!res.status && (answers.length > 0 || queriesNum < MAX_ATTEMPT)) {
        if (answers.length === 0) {
          answers.push(...await oracle.query(goal, params, cancellationToken));
          queriesNum++;
        }
        if (answer = answers.pop()) {
          tactics = await Tokenizer.get().tokenize(answer, Scope.PROOF_BODY);
          res = await this.insert(tactics, 0, true, cancellationToken);
          if (!res.status)
            params.errorHistory?.push({ tactics: tactics, message: res.message });
        }
      }

      if (!res.status) 
        this.insert(tactics, 0, false, cancellationToken);
    }

    return this;
  }

  deepcopy() {
    return new ProofMeta(this.uri, this.keyword, this.name, this.type, this.body.deepcopy(), this.editorLocation);
  }

  toString() {
    return `${this.keyword} ${this.name}: ${this.type}. Proof. ${this.body.toString()} Qed.`;
  }
}

class ProofBlock {
  private state: PetState | PetState.Default;
  private open: boolean = true;
  private elements: Element[] = [];

  constructor(state: PetState | PetState.Default.INCONSISTENT) {
    this.state = state;
  }

  openSubProofs(): ProofBlock[] {
    const openSubProofs = this.elements.flatMap(element =>
      element instanceof ProofBlock ? element.openSubProofs() : []);

    if (this.open) openSubProofs.push(this);
    
    return openSubProofs;
  }

  async insert(tokens: Token[], execute: boolean, cancellationToken?: vscode.CancellationToken) {
    if (!this.open) throw new Error('Proof completed');

    const baseLineIdx = tokens[0].range.start.line;
    const newElements: Element[] = [];
    let interState = this.state;
    
    for (const token of tokens) {
      if (token.scopes.includes(Name.ADMIT))
        newElements.push(new ProofBlock(interState));
      else
        newElements.push({ ...token, range: new vscode.Range(token.range.start.translate(-baseLineIdx), token.range.end.translate(-baseLineIdx)) });
    
      if (execute && token.scopes.includes(Name.EXECUTABLE)) {
        if (interState === PetState.Default.INCONSISTENT)
          throw new Error('Cannot execute in an inconsistent state');
        else try {
          interState = await CoqLSPClient
            .get()
            .sendRequest(Request.Petanque.run, { st: interState.st, tac: token.value.trim() }, cancellationToken);
        } catch (error) {
          const _error = error as Error;
          let parsedMessage;
          if ((parsedMessage = _error.message.match(/Coq: (?<message>[\s\S]*)/m)) && parsedMessage.groups)
            return { status: false, message: parsedMessage.groups['message'] };
          else
            return { status: false, message: _error.message };
        }
      }
    }

    this.elements.push(...newElements);
    this.state = interState;

    const goals = await this.goals(cancellationToken);
    if (goals.length === 0) this.open = false;

    return { status: true };
  }

  async goals(cancellationToken?: vscode.CancellationToken) {
    if (this.state === PetState.Default.INCONSISTENT)
      throw new Error('Cannot get goals of an inconsistent state');

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