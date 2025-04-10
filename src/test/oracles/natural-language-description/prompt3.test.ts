import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt3 from '../../../oracles/natural-language-description/prompt3';
import { Token } from '../../../syntax/tokenizer';

suite('Prompt3 Test Suite', () => {
  test('Complete', () => {
    const params = {
      errorHistory: [{
        tactics: [
          Token.Standard.FOCUSING_CONSTRUCT_TACTIC('tactic.'),
          Token.Standard.FOCUSING_CONSTRUCT_DASH,
          Token.Standard.FOCUSING_CONSTRUCT_TACTIC('tactic1; tactic2.'),
          Token.Standard.FOCUSING_CONSTRUCT_CROSS,
          Token.Standard.FOCUSING_CONSTRUCT_TACTIC('tactic.'),
          Token.Standard.FOCUSING_CONSTRUCT_CROSS,
          Token.Standard.FOCUSING_CONSTRUCT_TACTIC('tactic.'),
          Token.Standard.FOCUSING_CONSTRUCT_TACTIC('tactic.'),
          Token.Standard.FOCUSING_CONSTRUCT_DASH,
          Token.Standard.FOCUSING_CONSTRUCT_TACTIC('tactic.')
        ],
        at: 2,
        message:
    `
    Coq: In environment
    X : Type
    test : X -> bool
    x : X
    l : list X
    IHl : forallb test l = true <-> All (fun x : X => test x = true) l
    Hx : test x = true
    Hl : All (fun x : X => test x = true) l
    Unable to unify "true" with "test x && forallb test l".
    `
      }]
    };

    const messages = prompt3.render(params);
   
    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});