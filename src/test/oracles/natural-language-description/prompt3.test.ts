import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt3 from '../../../oracles/natural-language-description/prompt3';

suite('Prompt3 Test Suite', () => {
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

    const proofNLDescription = `\
1. **Step 1: Analyze the first part of the goal (inequality for all \`t\`)**  
   - Rewrite the expression \`exp (t * ln 2)\` using the property of logarithms and exponents: \`exp (t * ln 2) = 2^t\`. Similarly, \`exp (t * ln 4) = 4^t = (2^2)^t = (2^t)^2\`.
   - Substitute these into the inequality:  
     \`((2^t - 3 * t) * t) / (2^t)^2 <= 1 / 12\`.  
   - Simplify the denominator:  
     \`((2^t - 3 * t) * t) / 2^(2t) <= 1 / 12\`.  
   - Multiply through by \`2^(2t)\` (valid since \`2^(2t) > 0\` for all \`t\`):  
     \`(2^t - 3 * t) * t <= (1 / 12) * 2^(2t)\`.  
   - Analyze the behavior of the left-hand side and right-hand side as functions of \`t\` to confirm the inequality holds for all \`t\`.

2. **Step 2: Prove the existence of \`t0\` for the equality**  
   - Consider the function \`f(t) = ((2^t - 3 * t) * t) / 2^(2t)\`.  
   - Rewrite it as \`f(t) = (t * (2^t - 3 * t)) / 2^(2t)\`.  
   - Show that \`f(t)\` is continuous for all \`t\` (using properties of exponential and polynomial functions).  
   - Use the Intermediate Value Theorem (IVT):  
     - Evaluate \`f(t)\` at specific points (e.g., \`t = 0\` and \`t = 1\`) to show that \`f(t)\` transitions from below \`1 / 12\` to above \`1 / 12\`.  
     - Conclude that there exists a \`t0\` such that \`f(t0) = 1 / 12\`.  

3. **Step 3: Combine results**  
   - The inequality holds for all \`t\` by analysis in Step 1.  
   - The existence of \`t0\` satisfying the equality is guaranteed by the IVT in Step 2.  
   - Therefore, the goal is proven.`;
  
    const messages = prompt3.render(goal, proofNLDescription);
   
    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});