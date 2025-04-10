import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt1 from '../../../oracles/natural-language-description/prompt1';

suite('Prompt1 Test Suite', () => {
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

    const messages = prompt1.render(goal);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});