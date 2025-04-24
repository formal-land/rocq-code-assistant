import path from 'path';
import { Name } from '../syntax/scope';
import { Token } from '../syntax/tokenizer';
import * as utils from '../utils';
import * as extractors from '../syntax/extractors';

export interface Comment {
  hints?: string[],
  examples?: string[];
}

export namespace Comment {
  export async function fromTokens(tokens: Token[], baseFilePath: string) {
    return {
      hints: hintsFromToken(tokens), 
      examples: await examplesFromToken(tokens, baseFilePath)
    };
  }

  function hintsFromToken(tokens: Token[]) {
    const hintsTokens = tokens
      .filter(token => token.scopes.includes(Name.HINT) || token.scopes.includes(Name.HINT_KEYWORD));
    if (hintsTokens.length === 0) return;
    
    const hintsSplitIdx = hintsTokens.reduce((acc, token, idx) => token.scopes.includes(Name.HINT_KEYWORD) ? [...acc, idx] : acc, [] as number[]);
    const hints = utils.split(hintsTokens, hintsSplitIdx)
      .map(hintTokens => hintTokens
        .slice(1)
        .map(token => token.value.trim()).join(' '));
  
    return hints;
  }
  
  async function examplesFromToken(tokens: Token[], baseFilePath: string) {
    let examplesTokens = tokens
      .filter(token => token.scopes.includes(Name.EXAMPLE) || token.scopes.includes(Name.EXAMPLE_KEYWORD));
    if (examplesTokens.length === 0) return;

    const examplesSplitIdx = examplesTokens
      .reduce((acc, token, idx) => token.scopes.includes(Name.EXAMPLE_KEYWORD) ? [...acc, idx] : acc, [] as number[]);
    const examples = await Promise.all(utils.split(examplesTokens, examplesSplitIdx)
      .map(async exampleTokens => {
        const exampleProofName = exampleTokens
          .slice(1)
          .filter(token => token.scopes.includes(Name.EXAMPLE_NAME))
          .map(token => token.value.trim())
          .join(' ');
        let exampleFilePath = exampleTokens
          .slice(1)
          .filter(token => token.scopes.includes(Name.EXAMPLE_PATH))
          .map(token => token.value.trim())
          .join(' ');
        if (exampleFilePath === '')
          exampleFilePath = path.basename(baseFilePath);
        const proofTokens = await extractors.extractProofTokensFromName(exampleProofName, path.join(path.dirname(baseFilePath), exampleFilePath));
  
        if (proofTokens) 
          return proofTokens.map(token => token.value).join(' ');
        else return undefined;
      }));
  
    return examples.filter(example => example !== undefined);
  }
}