import * as vscode from 'vscode';
import path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as vsctm from 'vscode-textmate';
import * as oniguruma from 'vscode-oniguruma';
import { Scope } from './scope';

const NEW_LINE_REGEX = /\r?\n|\r|\n/g;

export interface Token {
  value: string,
  scopes: string[],
  range: vscode.Range
}

export class Tokenizer {
  private static instance: Tokenizer;
  private registry: vsctm.Registry;

  static get() {
    if (!this.instance) this.instance = new Tokenizer();
    return this.instance;
  }

  private constructor() {
    console.log(__dirname);
    const wasmBin = fs.readFileSync(path.join(__dirname, '../../node_modules/vscode-oniguruma/release/onig.wasm')).buffer;
    const vscodeOnigurumaLib = oniguruma
      .loadWASM(wasmBin)
      .then(() => {
        return {
          createOnigScanner(patterns: string[]) { return new oniguruma.OnigScanner(patterns); },
          createOnigString(s: string) { return new oniguruma.OnigString(s); }
        };
      });

    const grammars = [ 
      { path: path.join(__dirname, ('../../resources/syntaxes/coq-proof.json')), scopeName: Scope.PROOF },
      { path: path.join(__dirname, ('../../resources/syntaxes/coq-proof-body.json')), scopeName: Scope.PROOF_BODY } 
    ];

    this.registry = new vsctm.Registry({
      onigLib: vscodeOnigurumaLib,
      loadGrammar: async (scopeName) => {
        const grammar = grammars.find(gramRef => gramRef.scopeName === scopeName);
        if (!grammar) return Promise.reject(`Unknown scope ${scopeName}`);

        const data = await fsp.readFile(grammar.path);
        return vsctm.parseRawGrammar(data.toString(), grammar.path);
      }
    });
  }

  async tokenize(text: string, scopeName: Scope) {
    const grammar = await this.registry.loadGrammar(scopeName);
    if (!grammar) throw Error(`Cannot load grammar for scope ${scopeName}`);

    const lines = text.split(NEW_LINE_REGEX);
    const tokens: Token[] = [];
    let ruleStack = vsctm.INITIAL;
    for (const [lineIdx, line] of lines.entries()) {
      const tokenizedLine = grammar.tokenizeLine(line, ruleStack);
      
      const newTokens = tokenizedLine
        .tokens
        .map(token => ({
          value: line.substring(token.startIndex, token.endIndex),
          scopes: token.scopes,
          range: new vscode.Range(lineIdx, token.startIndex, lineIdx, token.endIndex) }));
      tokens.push(...newTokens);
      
      ruleStack = tokenizedLine.ruleStack;
    }

    return tokens;
  }
}