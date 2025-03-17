import * as vscode from 'vscode';
import * as assert from 'assert';
import { renderPrompt } from '@vscode/prompt-tsx';
import * as utils from '../../../utils';
import { Prompt } from '../../../oracles/basic-LLM/prompt';
import * as openAI from '../../../model-providers/openai';

suite('Extension Test Suite', () => {
  test('Prompt 1', async () => {
    const goal = {
      ty: 'aaaa',
      hyps: [
        { ty: 'bbbb', names: ['a', 'b', 'c'] },
        { ty: 'cccc', names: ['d', 'e', 'f'] },
        { ty: 'dddd', names: ['g', 'h', 'i'] }
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

    const prompt = await renderPrompt(
      Prompt, { goal, params }, { modelMaxPromptTokens: 100000 }, openAI.tokenizer('o1-mini'));

    assert.fail(utils.languageModelChatMessagesToString(prompt.messages));
  });
});
