import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt1 from '../../../oracles/basic-LLM/prompt1';
import { Token } from '../../../syntax/tokenizer';

suite('Extension Test Suite', () => {
  test('Complete', () => {
    const goal = {
      ty: 'test x && forallb test l = true',
      hyps: [
        { ty: 'Type', names: ['X'] },
        { ty: 'X -> bool', names: ['test'] },
        { ty: 'X', names: ['x', 'y'] },
        { ty: 'list X', names: ['l'] },
        { ty: 'forallb test l = true <-> All (fun x0 : X => test x0 = true) l', names: ['IHl'] },
        { ty: 'test x = true /\\ All (fun x0 : X => test x0 = true) l', names: ['H'] }
      ]
    };

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
      }],
      hints: [
        'Use the tactic `tactic1` to solve the goal.',
        'Use the tactic `tactic2` to solve the goal.',
        'Use the tactic `tactic3` to solve the goal.',]
    };

    const messages = prompt1.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });

  test('Without hypoteses', () => {
    const goal = {
      ty: 'test x && forallb test l = true',
      hyps: []
    };

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

    const messages = prompt1.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });

  test('Without error history', () => {
    const goal = {
      ty: 'test x && forallb test l = true',
      hyps: [
        { ty: 'Type', names: ['X'] },
        { ty: 'X -> bool', names: ['test'] },
        { ty: 'X', names: ['x', 'y'] },
        { ty: 'list X', names: ['l'] },
        { ty: 'forallb test l = true <-> All (fun x0 : X => test x0 = true) l', names: ['IHl'] },
        { ty: 'test x = true /\\ All (fun x0 : X => test x0 = true) l', names: ['H'] }
      ]
    };

    const params = {
      errorHistory: []
    };

    const messages = prompt1.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });

  test('Without parameters', () => {
    const goal = {
      ty: 'test x && forallb test l = true',
      hyps: [
        { ty: 'Type', names: ['X'] },
        { ty: 'X -> bool', names: ['test'] },
        { ty: 'X', names: ['x', 'y'] },
        { ty: 'list X', names: ['l'] },
        { ty: 'forallb test l = true <-> All (fun x0 : X => test x0 = true) l', names: ['IHl'] },
        { ty: 'test x = true /\\ All (fun x0 : X => test x0 = true) l', names: ['H'] }
      ]
    };

    const messages = prompt1.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});
