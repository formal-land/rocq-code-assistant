import * as assert from 'assert';
import * as utils from '../../../utils';
import * as prompt3 from '../../../oracles/natural-language-description/prompt3';

suite('Prompt3 Test Suite', () => {
  test('Complete', () => {
    const params = {
      comment: {
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
        ],
        uses: [
          'Theorem restricted_excluded_middle : forall P b, (P <-> b = true) -> P \/ ~ P.',
          'Theorem restricted_excluded_middle_eq : forall (n m : nat), n = m \/ n <> m.'
        ]
      }
    };

    const messages = prompt3.render(params);
   
    assert.fail('\n' + utils.languageModelChatMessagesToString(messages));
  });
});