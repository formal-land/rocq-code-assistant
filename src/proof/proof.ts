import * as vscode from 'vscode';
import * as utils from '../utils';
import { Token } from '../syntax/tokenizer';
import { PetState } from '../lib/coq-lsp/types';
import { CoqLSPClient, Request } from '../coq-lsp-client';
import { Name, Scope } from '../syntax/scope';
import { Oracle } from '../oracles/oracle';
import { Comment } from './comment';

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

  private static async init(name: string, type: string, metadata: Proof.Metadata, body: Token[], cancellationToken?: vscode.CancellationToken) {
    const startingState = await CoqLSPClient.get()
      .sendRequest(Request.Petanque.start, { uri: vscode.Uri.file(metadata.filePath).toString(), thm: name, pre_commands: null }, cancellationToken);
    const workingBlock = new Proof.WorkingBlock(startingState, startingState, { comment: {} });
    const proof = new Proof(name, type, [workingBlock], metadata);
    const tryResult = await workingBlock.try(body, cancellationToken);
    
    if (tryResult.status) {
      workingBlock.accept();
      proof.merge(workingBlock);
    } else {
      vscode.window.showErrorMessage('The proof contains some errors. Please, fix or admit them.');
      throw new Error('Proof contains errors.');
      // TODO: workingBlock.repair();
    }

    proof.body
      .filter(element => element instanceof Proof.WorkingBlock)
      .forEach((element, idx) => element.metadata.comment = {
        hints: proof.metadata.comments[idx]?.hints,
        examples: proof.metadata.comments[idx]?.examples
      });

    return proof;
  }

  static async fromTokens(filePath: string, tokens: Token[], cancellationToken?: vscode.CancellationToken, ignoreComments: boolean = false) {
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

    const commentsTokens = tokens
      .filter(token => token.scopes.includes(Name.COMMENT));
    const commentsSplitIdx = commentsTokens
      .reduce((acc, token, idx) => token.value.endsWith('*)') ? [...acc, idx + 1] : acc, [] as number[]);
    const splitCommentsTokens = utils.split(commentsTokens, commentsSplitIdx);
    const comments = await Promise.all(tokens
      .filter(token => token.scopes.includes(Name.ADMIT))
      .map(admitToken => {
        const associatedComment = splitCommentsTokens.find(commentTokens => {
          const lastCommentTokenIdx = tokens.indexOf(commentTokens[commentTokens.length -1]);
          const admitTokenIdx = tokens.indexOf(admitToken);
            
          return lastCommentTokenIdx < admitTokenIdx && 
            !tokens
              .slice(lastCommentTokenIdx, admitTokenIdx)
              .some(token => token.scopes.includes(Name.TACTIC));
        });

        return associatedComment ? Comment.fromTokens(associatedComment, filePath) : undefined;
      }));
      
    const bodyEditorLocation = new vscode.Range(
      bodyTokens[0].range.start.line, 
      bodyTokens[0].range.start.character, 
      bodyTokens[bodyTokens.length - 1].range.end.line, 
      bodyTokens[bodyTokens.length - 1].range.end.character);
        
    return Proof.init(name, type, { keyword, filePath, bodyEditorLocation, comments }, bodyTokens, cancellationToken);
  }

  private merge(workingBlock: Proof.WorkingBlock) {
    this.body.splice(this.body.indexOf(workingBlock), 1, ...workingBlock.templatize());
  }

  async autocomplete(oracles: Oracle[], cancellationToken?: vscode.CancellationToken) {
    const workingBlocks = this.body.filter(element => element instanceof Proof.WorkingBlock);
    
    for (const workingBlock of workingBlocks) {
      await workingBlock.autocomplete(oracles, cancellationToken);
      this.merge(workingBlock);
    }

    if (!this.body.find(element => !element.petState)) {
      const lastElement = this.body.at(-1);
      if (lastElement) lastElement.tokens()[0].value = 'Qed.';
      return true;
    } else return false;
  }

  toString() {
    return `${this.metadata.keyword} ${this.name}: ${this.type}
${
  this.body
    .flatMap(element => element.tokens())
    .map(token => token.value)
    .join(' ')
}`;
  }
}

export namespace Proof {

  /** 
   * Metadata for a {@link Proof}. 
   */
  export interface Metadata {

    /**
     * The keyword that introduces the proof definition (Theorem, Lemma, etc.)
     */
    keyword: string,

    /**
     * The path of the file where the proof is defined.
     */
    filePath: string, 
    
    /**
     * Location of the proof in the edited file.
     */
    bodyEditorLocation: vscode.Range,

    comments: (Comment | undefined)[]
  }

  /**
   * Each {@link Element} represents a more or less structured part of a proof, containing zero or more 
   * tokens. 
   */
  export abstract class Element {

    /**
     * Petanque state that represents, from the outside, the result of a possible global successfull 
     * execution of this element.
     */
    petState?: PetState;

    /**
     * @param petState Pre-assigned Petanque state that represents, from the outside, the result 
     * of a possible global successfull execution of this element.
     */
    constructor(petState?: PetState) {
      this.petState = petState;
    }

    /**
     * The sequence of tokens contained in this element.
     * 
     * @returns Zero or more tokens contained in this element.
     */
    abstract tokens(): Token[];
  }

  /**
   * Represents an {@link Element} containing a single token.
   */
  export class SingleToken extends Element {

    /**
     * The token contained in this element.
     */
    token: Token;

    /**
     * @param token The token to be contained in this element.
     * @param petState Pre-assigned Petanque state that represents, from the outside, the result 
     * of a possible global successfull execution of this element.
     */
    constructor(token: Token, petState?: PetState) {
      super(petState);
      this.token = token;
    }

    /**
     * @returns A list with the only token contained in this element.
     */
    tokens() {
      return [this.token];
    }

    toString() {
      return this.token.value;
    }
  }

  /**
   * Represents an {@link Element} containing multiple tokens. Allows for the modification of the 
   * tokens using a simple interaction protocol.
   */
  export class WorkingBlock extends Element {
    readonly elements: WorkingBlock.Element[];
    metadata: WorkingBlock.Metadata;
  
    /**
     * @param petState A Petanque state that represents, from the outside, a global successfull 
     * execution of this element.
     * @param startingState A Petanque state that is used as the starting execution point of the 
     * tokens added to the block.
     */
    constructor(petState: PetState, startingState: PetState, metadata: WorkingBlock.Metadata) {
      super(petState);
      this.elements = [ new WorkingBlock.StartToken(startingState) ];
      this.metadata = metadata;
    }

    /**
     * @returns A plain list of tokens contained in each subelement.
     */
    tokens() {
      return this.elements.flatMap(element => element.tokens());
    }
  
    /**
     * 
     * @param tokens 
     * @param cancellationToken 
     * @returns 
     */
    async try(tokens: Token[], cancellationToken?: vscode.CancellationToken) {
      let result = WorkingBlock.TryResult.success();

      const normTokens = WorkingBlock.normalize(tokens);

      for (const token of normTokens) {            
        const execPetState = this.elements.at(-1)?.petState;
        let newPetState;
        if (token.scopes.includes(Name.EXECUTABLE)) {
          if (execPetState) {
            try {
              newPetState = await CoqLSPClient.get()
                .sendRequest(Request.Petanque.run, { st: execPetState.st, tac: token.value }, cancellationToken);
            } catch (error) {
              result = WorkingBlock.TryResult.failure(error as Error, tokens.findIndex(_token => _token.range === token.range));
            }
          }
        } else {
          newPetState = this.elements.at(-1)?.petState;
        }
  
        this.elements.push(new WorkingBlock.SingleToken(token, false, execPetState, newPetState));
      }
  
      return result;
    }

    pendings() {
      return this.elements.filter(element => !element.accepted);
    }
  
    /**
     * Accepts all the pending tokens.
     */
    accept() {
      this.elements.forEach(element => { if (!element.accepted) element.accepted = true; });
    }
  
    /**
     * Rejects all the pending tokens.
     */
    reject() {
      this.elements.splice(this.elements.findIndex(element => !element.accepted));
    }

    /**
     * 
     */
    repair() {
      throw new Error('To be implemented!');
    }

    /**
     * @returns A list of {@link Element} where admit are substitued by new {@link WorkingBlock}.
     */
    templatize() {
      return this.elements.flatMap(element => element.templatize(this.metadata));
    }

    /**
     * Executes a series of useful standard _normalization_ procedures on a list of tokens.
     * @param tokens the list of tokens to be _normalized_.
     * @returns a new list of _normalized_ tokens.
     */
    private static normalize(tokens: Token[]): Token[] {
      // 1. Removing spaces and empty tokens
      tokens = tokens
        .map(token => ({ ...token, value: token.value.trim() }))
        .filter(token => token.value !== '');

      // 2. Adding curly braces around every admit that is not already put inside curly braces
      const admitIdxs = tokens
        .filter(token => token.scopes.includes(Name.ADMIT))
        .map(token => tokens.indexOf(token));

      tokens = tokens.flatMap((token, idx) => {
        const prevToken = tokens.at(idx - 1);
        const succToken = tokens.at(idx + 1);
        if (admitIdxs.includes(idx) && prevToken && succToken && 
            !(prevToken.scopes.includes(Name.FOCUSING_CONSTRUCT) && prevToken.value === '{') &&
            !(succToken.scopes.includes(Name.FOCUSING_CONSTRUCT) && succToken.value === '}')) {
          return [Token.Standard.FOCUSING_CONSTRUCT_LEFT_CURLY, token, Token.Standard.FOCUSING_CONSTRUCT_RIGHT_CURLY];
        } else return [token];
      });

      return tokens;
    }
  
    /**
     * @param oracles List of oracles to be called.
     * @param cancellationToken
     */
    async autocomplete(oracles: Oracle[], cancellationToken?: vscode.CancellationToken) {
      const MAX_ATTEMPTS = 5;
      const answers = [];
      const oracleParams: Oracle.Params = {
        comment: this.metadata.comment
      };
      let attempts = 0;
      let goals;
      let repairable;
      let error: Oracle.Error = { at: 0, message: '' };
  
      while ((goals = await this.goals()).length > 0 && (answers.length > 0 || attempts < MAX_ATTEMPTS)) {
        if (answers.length === 0) {
          if (attempts === 0) repairable = await oracles[0].query(goals[0], oracleParams, cancellationToken);
          else repairable = await (<Oracle.Repairable>repairable).repair(error);
          answers.push(repairable.response);
          attempts++;
        }
        
        const answer = answers.pop();
        if (answer) {
          const tryResult = await this.try(answer, cancellationToken);
          if (!tryResult.status)
            error = { 
              at: tryResult.error.at, 
              message: tryResult.error.message };
          if (tryResult.status || (!tryResult.status && (answers.length === 0 && attempts === MAX_ATTEMPTS))) {
            this.accept();
          } else
            this.reject();
        }
      }
    }
  
    /**
     * @param cancellationToken 
     * @returns The current open goal for this block.
     */
    async goals(cancellationToken?: vscode.CancellationToken) {
      const lastPetState = this.elements.at(-1)?.petState;
      if (lastPetState) {
        const goals = await CoqLSPClient.get()
          .sendRequest(Request.Petanque.goals, { st: lastPetState.st }, cancellationToken);
        return goals.goals;
      } else return [];
    }
  
    /**
     * @returns A string representation of this block.
     */
    toString() {
      return this.elements
        .flatMap(element => element.tokens())
        .map(token => token.value)
        .join(' ');
    }
  }

  export namespace WorkingBlock {

    /** 
     * Metadata for a {@link WorkingBlock}. 
     */
    export interface Metadata {
      comment: Comment
    }

    /**
     * Extension of {@link Proof.Element} to allow incremental build of a proof.
     */
    export abstract class Element extends Proof.Element {

      /**
       * Flag to determine if the element has been permanently accepted insied the 
       * {@link WorkingBlock}.
       */
      accepted: boolean;

      /**
       * @param accepted If the element has been permanently accepted insied the {@link WorkingBlock}.
       * @param petState A possibile pre-assigned Petanque state that represents, from the outside, a
       * global successfull execution of this element.
       */
      constructor(accepted: boolean, petState?: PetState) {
        super();
        this.accepted = accepted;
        this.petState = petState;
      }

      /**
       * Generates a templatized version of this element.
       */
      abstract templatize(metadata: WorkingBlock.Metadata): Proof.Element[];
    }

    /**
     * {@link WorkingBlock} version of {@link Proof.SingleToken}.
     */
    export class SingleToken extends Element {

      /**
       * The state in which the element has been executed.
       */
      prePetState?: PetState;

      /**
       * The token contained in this element.
       */
      token: Token;

      /**
       * 
       * @param token The token contained in this element.
       * @param accepted If the element has been permanently accepted insied the {@link WorkingBlock}.
       * @param prePetState The state in which the element has been executed.
       * @param petState A possibile pre-assigned Petanque state that represents, from the outside, a
       * global successfull execution of this element.
       */
      constructor(token: Token, accepted: boolean, prePetState?: PetState, petState?: PetState) {
        super(accepted, petState);
        this.prePetState = prePetState;
        this.token = token;
      }

      /**
       * If this element contains a token that is an 'admit' and is part of a valid executions,
       * returns a new {@link WorkingBlock} TODO:!
       * @returns 
       */
      templatize(metadata: WorkingBlock.Metadata) {
        if (this.petState && this.prePetState && this.token.scopes.includes(Name.ADMIT))
          return [ new WorkingBlock(this.petState, this.prePetState, metadata) ];
        else 
          return [ new Proof.SingleToken(this.token, this.petState) ];
      }

      tokens() { return [ this.token ]; }

      toString() { return this.token.value; }
    }

    /**
     * Represents a convenient way of storing the Petanque start state for a {@link WorkingBlock}.
     */
    export class StartToken extends Element {

      /**
       * @param petState A Petanque state.
       */
      constructor(petState: PetState) {
        super(true, petState);
      }

      /**
       * @returns An empty array. This element is ignored while templatizing.
       */
      templatize() { return []; }
  
      /**
       * @returns An empty array. No token is contained in this element.
       */
      tokens() { return []; }
    }

    /**
     * Result of the execution of a {@link WorkingBlock.try}.
     */
    export type TryResult = 
      { status: true } | 
      { status: false, error: { at: number, message: string }}

    export namespace TryResult {
      export function success(): TryResult {
        return { status: true };
      }

      export function failure(error: Error, at: number): TryResult {
        const parsedMessage = error.message.match(/Coq: (?<message>[\s\S]*)/m);
        if (parsedMessage && parsedMessage.groups)
          return { status: false, error: { at: at, message: parsedMessage.groups['message'] }};
        else
          return { status: false, error: { at: at, message: error.message }};
      }
    }
  }
}