import { LanguageClient } from 'vscode-languageclient/node';
import { Proof, ProofMeta } from './syntax/coq-proof';
import { Stack } from './utils';
import { Request } from './coq-lsp-client';
import { GoalConfig, PpString } from './lib/coq-lsp/types';

type Element = Block | string;

class Block {
  elements: Element[];
  lastChecked: number;

  constructor() {
    this.elements = [];
    this.lastChecked = -1;
  }

  nextToBeChecked() {
    if (this.lastChecked < this.elements.length - 1)
      return this.elements[++this.lastChecked];
  }

  proof() : Proof {
    return this.elements
      .map(element => element instanceof Block ? element.proof() : [element])
      .reduce((proof, element) => proof.concat(element));
  }
}

export class ProofTemplate {
  mainBlock: Block;
  blockStack: Stack<Block>;
  state: { st: number, proof_finished: boolean };
  coqLSPClient: LanguageClient;

  private constructor(state: { st: number, proof_finished: boolean }, coqLSPClient: LanguageClient, 
    startingElements?: Element[]) {
    this.mainBlock = new Block();
    this.blockStack = new Stack();
    this.state = state;
    this.coqLSPClient = coqLSPClient;

    if (startingElements) 
      this.mainBlock.elements.push(...startingElements);

    this.blockStack.push(this.mainBlock);
  }

  update(element: Element) {
    this.blockStack.peek()?.elements.push(element);
  }

  async checkUpdates() {
    let element: Element | undefined;
    let goals: GoalConfig<PpString>;

    while (element = this.blockStack.peek()?.nextToBeChecked()) 
      if (element instanceof Block) {
        this.blockStack.push(element);
      } else {
        this.state = await this.coqLSPClient.sendRequest(
          Request.Petanque.run, { st: this.state.st, tac: element });
        goals = await this.coqLSPClient.sendRequest(
          Request.Petanque.goals, { st: this.state.st });
        if (goals.goals.length === 0)
          this.blockStack.pop();
      }
  }

  proof() {
    return this.mainBlock.proof();
  }

  static async fromProofMeta(proofMeta: ProofMeta, coqLSPClient: LanguageClient) {
    const startState = await coqLSPClient.sendRequest(
      Request.Petanque.start, { uri: proofMeta.uri, thm: proofMeta.name, pre_commands: null });

    const startingElements = proofMeta.body.map(({ token, tags }) =>
      tags.includes('meta.proof.body.tactic.admit.coq') ? new Block() : token
    );

    return new ProofTemplate(startState, coqLSPClient, startingElements);
  }
}