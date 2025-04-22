import { NaturalLanguageDescription } from '../../../oracles/natural-language-description/oracle';
import { TestModelProvider } from '../../utils/model-provider';

suite('Chat Test Suite', () => {
  test('Complete', async () => {
    const oracle = new NaturalLanguageDescription(new TestModelProvider([
      'Model answer 1',
      'Model answer 2',
      `\
\`\`\`coq
  tactic1.
  tactic2.
  tactic3.
    + tactic4.
    + tactic5.
  tactic6.
\`\`\``, `\
\`\`\`coq
  tactic1.
  tactic2.
  tactic3.
    + tactic4.
    + tactic5.
  tactic6.
\`\`\``
    ]));

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
        ]
      }
    };

    const error1 = {
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
    };

    const error2 = {
      at: 6,
      message: 'Generic error message.'
    };

    let chat = await oracle.query(goal, params);
    chat = await chat.repair(error1);
    chat = await chat.repair(error2);
  });
});