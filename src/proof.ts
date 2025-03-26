import * as vscode from 'vscode';
import { Token, Tokenizer } from './syntax/tokenizer';
import { PetState } from './lib/coq-lsp/types';
import { CoqLSPClient, Request } from './coq-lsp-client';
import { Name, Scope } from './syntax/scope';
import { Oracle, OracleParams } from './oracles/types';

namespace Proof {
  export interface Metadata {
    keyword: string,
    uri: string,
    editorLocation: vscode.Range
  }

  export type Element = Token | WorkingBlock;
}

export class Proof {
  readonly name: string;
  readonly type: string;
  readonly body: Proof.Element[];
  readonly metadata: Proof.Metadata;

  private constructor(name: string, type: string, body: Proof.Element[], metadata: Proof.Metadata) {
    this.name = name;
    this.type = type;
    this.body = body;
    this.metadata = metadata;
  }

  private static async init(name: string, type: string, metadata: Proof.Metadata, body?: Token[], cancellationToken?: vscode.CancellationToken) {
    const startingState = await CoqLSPClient.get()
      .sendRequest(Request.Petanque.start, { uri: metadata.uri, thm: name, pre_commands: null }, cancellationToken);
    const workingBlock = new WorkingBlock(startingState);
    const proof = new Proof(name, type, [workingBlock], metadata);
    if (body) {
      const tryResult = await workingBlock.try(body, cancellationToken);
      if (tryResult.status) {
        workingBlock.accept();
        proof.merge(workingBlock, true);
      } else {
        workingBlock.repair();
      }
    }
    return proof;
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
      
    const editorLocation = new vscode.Range(
      tokens[0].range.start.line, 
      tokens[0].range.start.character, 
      tokens[tokens.length - 1].range.end.line, 
      tokens[tokens.length - 1].range.end.character);
        
    return Proof.init(name, type, { keyword, uri, editorLocation }, bodyTokens, cancellationToken);
  }

  private merge(workingBlock: WorkingBlock, templatize: boolean) {
    const newElements = workingBlock.body
      .slice(1)
      .map(element => {
        const prePetState = workingBlock.body[workingBlock.body.indexOf(element) - 1].petState;
        return templatize && element.token.scopes.includes(Name.ADMIT) && prePetState ?
          new WorkingBlock(prePetState) : element.token;
      });

    this.body.splice(this.body.indexOf(workingBlock), 1, ...newElements);
  }

  async autocomplete(oracles: Oracle[], cancellationToken?: vscode.CancellationToken) {
    const workingBlocks = this.body.filter(element => element instanceof WorkingBlock);
    return Promise.all(workingBlocks.map(workingBlock => {
      return workingBlock.autocomplete(oracles, cancellationToken);
    }
    ));
  }
}

namespace WorkingBlock {
  export interface Element {
    token: Token, 
    petState?: PetState, // Petanque state after the execution of the token
    accepted: boolean
  }

  export type TryResult = 
    { status: true } | 
    { status: false, error: { at: number, message: string }}
}

export class WorkingBlock {
  private readonly startingState: PetState;
  readonly body: WorkingBlock.Element[] = [];

  constructor(startingState: PetState) {
    this.startingState = startingState;
  }

  async try(tokens: Token[], cancellationToken?: vscode.CancellationToken) {
    let result: WorkingBlock.TryResult = { status: true };

    for (const [idx, token] of tokens.entries()) {
      let element: WorkingBlock.Element = { token: token, accepted: false };
     
      if (token.scopes.includes(Name.EXECUTABLE)) {
        const execPetState = this.body.at(-1) ? this.body.at(-1)?.petState : this.startingState;
        if (execPetState) {
          try {
            element.petState = await CoqLSPClient.get()
              .sendRequest(Request.Petanque.run, { st: execPetState.st, tac: token.value }, cancellationToken);
          } catch (error) {
            const parsedMessage = (error as Error).message.match(/Coq: (?<message>[\s\S]*)/m);
            if (parsedMessage && parsedMessage.groups)
              result = { status: false, error: { at: idx, message: parsedMessage.groups['message'] }};
          }
        }
      } else {
        element.petState = this.body.at(-1)?.petState;
      }

      this.body.push(element);
    }

    return result;
  }

  accept() {
    this.body.forEach(element => element.accepted = true);
  }

  reject() {
    this.body.splice(
      this.body.findIndex(element => !element.accepted));
  }

  repair() {
    throw new Error('To be implemented!');
  }

  async autocomplete(oracles: Oracle[], cancellationToken?: vscode.CancellationToken) {
    const MAX_ATTEMPTS = 3;
    const answers = [];
    const oracleParams: OracleParams = {
      errorHistory: []
    };
    let attempts = 0;
    let goals;

    while ((goals = await this.goals()).length > 0 && (answers.length > 0 || attempts < MAX_ATTEMPTS)) {
      if (answers.length === 0) {
        answers.push(...await oracles[0].query(goals[0], oracleParams, cancellationToken));
        attempts++;
      }
      
      const answer = answers.pop();
      if (answer) {
        const tokens = await Tokenizer.get().tokenize(answer, Scope.PROOF_BODY);
        const tryResult = await this.try(tokens, cancellationToken);
        if (!tryResult.status)
          oracleParams.errorHistory?.push({ tactics: tokens, message: tryResult.error.message });
        if (tryResult.status || (!tryResult.status && (answers.length === 0 && attempts === MAX_ATTEMPTS)))
          this.accept();
        else
          this.reject();
      }
    }
  }

  async goals(cancellationToken?: vscode.CancellationToken) {
    const lastPetState = this.body.at(-1)?.petState;
    if (lastPetState) {
      const goals = await CoqLSPClient.get()
        .sendRequest(Request.Petanque.goals, { st: lastPetState.st }, cancellationToken);
      return goals.goals;
    } else return [];
  }

  toString(): string {
    return this.body.join(' ');
  }
}