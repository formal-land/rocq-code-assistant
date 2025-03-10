// SYNTAX TEST "source.coq.proof.body"

intros A B HA HB. split.
// <----------------- meta.proof.body.tactic.coq
//                ^^^^^^ meta.proof.body.tactic.coq
  - apply HA.
//^ meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//  ^^^^^^^^^ meta.proof.body.tactic.coq
  - apply HB.
//^ meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//  ^^^^^^^^^ meta.proof.body.tactic.coq

intros P contra.
// <---------------- meta.proof.body.tactic.coq
destruct contra.
// <---------------- meta.proof.body.tactic.coq

(* Comment *)
// <------------- comment.block.coq - meta.proof.body.tactic.coq

intros P Q [HP HQ].
// <------------------- meta.proof.body.tactic.coq
split.
// <------ meta.proof.body.tactic.coq
  + (* left *) apply HQ   .
//^ meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//  ^^^^^^^^^^ comment.block.coq
//             ^^^^^^^^^^^^ meta.proof.body.tactic.coq
  + (* right *) apply HP.
//^ meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//  ^^^^^^^^^^^ comment.block.coq
//              ^^^^^^^^^ meta.proof.body.tactic.coq

intros A B HA HB. split.
// <----------------- meta.proof.body.tactic.coq
//                ^^^^^^ meta.proof.body.tactic.coq
{ admit. }
// <- meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//       ^ meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//^^^^^^  meta.proof.body.tactic.coq meta.proof.body.tactic.admit.coq
{ admit  . }
// <- meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//         ^ meta.proof.body.focus.coq - meta.proof.body.tactic.coq
//^^^^^^^^ meta.proof.body.tactic.coq meta.proof.body.tactic.admit.coq