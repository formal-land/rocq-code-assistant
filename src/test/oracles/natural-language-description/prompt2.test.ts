import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt2 from '../../../oracles/natural-language-description/prompt2';

suite('Prompt2 Test Suite', () => {
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

    const goalNLDescription = `\
**Types of variables:**
- \`t\` and \`t0\` are real numbers (\`R\`).

**Hypotheses:**
- None explicitly provided.

**Goal:**
- For all real numbers \`t\`, the expression \`((exp (t * ln 2) - 3 * t) * t) / exp (t * ln 4)\` is less than or equal to \`1 / 12\`.
- Additionally, there exists a real number \`t0\` such that the expression \`((exp (t0 * ln 2) - 3 * t0) * t0) / exp (t0 * ln 4)\` is exactly equal to \`1 / 12\`.
`;

    const messages = prompt2.render(goal, goalNLDescription);

    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});