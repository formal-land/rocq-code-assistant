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
        message: `\
Coq: In environment
X : Type
test : X -> bool
x : X
l : list X
IHl : forallb test l = true <-> All (fun x : X => test x = true) l
Hx : test x = true
Hl : All (fun x : X => test x = true) l
Unable to unify "true" with "test x && forallb test l".`
      }],
      hints: [
        'Use the tactic `tactic1` to solve the goal.',
        'Use the tactic `tactic2` to solve the goal.',
        'Use the tactic `tactic3` to solve the goal.'],
      examples: [`\
Theorem restricted_excluded_middle : forall P b,
  (P <-> b = true) -> P \/ ~ P.
Proof.
  intros P [] H.
  - left. rewrite H. reflexivity.
  - right. rewrite H. intros contra. discriminate contra.
Qed.`, `\
Theorem restricted_excluded_middle_eq : forall (n m : nat),
  n = m \/ n <> m.
Proof.
  intros n m.
  apply (restricted_excluded_middle (n = m) (n =? m)).
  symmetry.
  apply eqb_eq.
Qed.`
      ]
    };

    const messages = prompt3.render(params);
   
    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});