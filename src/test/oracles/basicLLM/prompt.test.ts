import * as vscode from 'vscode';
import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt from '../../../oracles/basic-LLM/prompt';

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
          { value: 'insert a at H.', scopes: [], range: new vscode.Range(0,0,0,0) },
          { value: 'split; auto.', scopes: [], range: new vscode.Range(0,0,0,0) },
          { value: 'auto.', scopes: [], range: new vscode.Range(0,0,0,0) }
        ],
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
