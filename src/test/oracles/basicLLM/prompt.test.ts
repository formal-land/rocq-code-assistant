import * as assert from 'assert';
import { renderPrompt } from '@vscode/prompt-tsx';
import * as utils from '../../../utils';
import * as prompt from '../../../oracles/basic-LLM/prompt';
import * as openAI from '../../../model-providers/openai';
import { Prompt } from '../../../oracles/basic-LLM/_prompt';
import { Token } from '../../../syntax/tokenizer';

suite('vscode-prompt-tsx', () => {
  test('Complete', async () => {
    const startTime = performance.now();

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
      }]
    };

    const prompt = await renderPrompt(Prompt, { goal, params }, { modelMaxPromptTokens: 100000 }, openAI.tokenizer('o1-mini'));

    const endTime = performance.now();
    assert.fail('\n' + utils.languageModelChatMessagesToString(prompt.messages) + `\n Time: ${(endTime - startTime)/1000}`);
  });

  /*
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

    const messages = prompt.render(goal, params);

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

    const messages = prompt.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
  */
});

suite('String interpolation', () => {
  test('Complete', () => {
    const startTime = performance.now();
    
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
      }]
    };

    const messages = prompt.render(goal, params);

    const endTime = performance.now();
    assert.fail('\n' + utils.languageModelChatMessagesToString(messages) + `\n Time: ${(endTime - startTime)/1000}`);
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

    const messages = prompt.render(goal, params);

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

    const messages = prompt.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});
