import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as vsctm from 'vscode-textmate';
import * as oniguruma from 'vscode-oniguruma';

export interface Tokenizer {
  tokenize(text: string): Promise<vsctm.ITokenizeLineResult[]>
}

// Creates a single grammar tokenizer (may be extended in future to handle multiple grammars)
export function create(onigurumaWASMPath: string, grammarPath: string, initialScopeName: string): Tokenizer {
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
      if (scopeName !== initialScopeName) return Promise.reject(`Unknown scope ${scopeName}`);

      const data = await fsp.readFile(grammarPath);
      return vsctm.parseRawGrammar(data.toString(), grammarPath);
    }
  });

  async function tokenize(text: string) {
    const grammar = await registry.loadGrammar(initialScopeName);

    if (!grammar) return Promise.reject('Cannot load grammar');

    const lines = text.split(/\r?\n|\r|\n/g);
    let ruleStack = vsctm.INITIAL;
    const tokenizedLines = new Array<vsctm.ITokenizeLineResult>;
    lines.forEach((line) => {
      const tokenizedLine = grammar.tokenizeLine(line, ruleStack);
      ruleStack = tokenizedLine.ruleStack;
      tokenizedLines.push(tokenizedLine);
    });
    return tokenizedLines;
  }

  return { tokenize };
}