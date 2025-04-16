import path from 'path';
import { Name } from '../syntax/scope';
import { Token } from '../syntax/tokenizer';
import * as utils from '../utils';
import * as extractors from '../syntax/extractors';

export class Comment {
  hints: string[];
  examples: string[];

  private constructor(hints: string[], examples: string[]) {
    this.hints = hints;
    this.examples = examples;
  }

  private static hintsFromToken(tokens: Token[]) {
    const hintsTokens = tokens.filter(token => token.scopes.includes(Name.HINT) || token.scopes.includes(Name.HINT_KEYWORD));
    const hintsSplitIdx = hintsTokens.reduce((acc, token, idx) => token.scopes.includes(Name.HINT_KEYWORD) ? [...acc, idx] : acc, [] as number[]);
    const hints = utils.split(hintsTokens, hintsSplitIdx)
      .map(hintTokens => hintTokens
        .slice(1)
        .map(token => token.value.trim()).join(' '));

    return hints;
  }

  private static async examplesFromToken(tokens: Token[], baseFilePath: string) {
    let examplesTokens = tokens
      .filter(token => token.scopes.includes(Name.EXAMPLE) || token.scopes.includes(Name.EXAMPLE_KEYWORD));
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

  static async fromTokens(tokens: Token[], baseFilePath: string) {
    return new Comment(
      this.hintsFromToken(tokens), 
      await this.examplesFromToken(tokens, baseFilePath));
  }
}