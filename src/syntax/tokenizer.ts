import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as vsctm from 'vscode-textmate';
import * as oniguruma from 'vscode-oniguruma';

export interface Tokenizer {
  tokenize(text: string, scopeName: string): Promise<vsctm.ITokenizeLineResult[]>
}

export interface GrammarReference {
  scopeName: string,
  path: string
}

const NEW_LINE_REGEX = /\r?\n|\r|\n/g;

export function create(onigurumaWASMPath: string, grammars: GrammarReference[]): Tokenizer {
  const wasmBin = fs.readFileSync(onigurumaWASMPath).buffer;
  const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
    return {
      createOnigScanner(patterns: string[]) { return new oniguruma.OnigScanner(patterns); },
      createOnigString(s: string) { return new oniguruma.OnigString(s); }
    };
  });

  const registry = new vsctm.Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: async (scopeName) => {
      const grammar = grammars.find(gramRef => gramRef.scopeName === scopeName);

      if (!grammar) return Promise.reject(`Unknown scope ${scopeName}`);

      const data = await fsp.readFile(grammar.path);
      return vsctm.parseRawGrammar(data.toString(), grammar.path);
    }
  });

  async function tokenize(text: string, scopeName: string) {
    const grammar = await registry.loadGrammar(scopeName);

    if (!grammar) return Promise.reject(`Cannot load grammar for scope ${scopeName}`);

    const lines = text.split(NEW_LINE_REGEX);
    let ruleStack = vsctm.INITIAL;

    const tokenizedLines = lines.map(line => {
      const tokenizedLine = grammar.tokenizeLine(line, ruleStack);
      ruleStack = tokenizedLine.ruleStack;
      return tokenizedLine;
    });
    
    return tokenizedLines;
  }

  return { tokenize };
}