// SYNTAX TEST "source.coq"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
// <----- meta.proof.coq keyword.source.coq - meta.proof.body.coq
//    ^^^^^^^^^ entity.name.function.theorem.coq
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - entity.name.function.theorem.coq
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq meta.proof.body.coq keyword.source.coq
  intros A B HA HB. split.
//^^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  - apply HA.
//  ^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  - apply HB.
//  ^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
Qed. (* Outside of proof *)
// <--- keyword.source.coq
// <---- meta.proof.coq meta.proof.body.coq
//   ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Theorem ex_falso_quodlibet : forall (P : Prop), False -> P.
// <----- meta.proof.coq keyword.source.coq - meta.proof.body.coq
//      ^^^^^^^^^^^^^^^^^^ entity.name.function.theorem.coq
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq meta.proof.body.coq keyword.source.coq
  intros P contra.
//^^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  destruct contra.  Qed. (* Outside of proof *)
//^^^^^^^^ support.function.builtin.ltac
//                  ^^^ keyword.source.coq
//^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
//                       ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

Theorem
// <------- meta.proof.coq keyword.source.coq - meta.proof.body.coq
  and_commut : forall P Q : Prop,
//^^^^^^^^^^ entity.name.function.theorem.coq
//             ^^^^^^^^^^^^^^^^^^ - entity.name.function.theorem.coq
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq 
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq 
Proof.
//<----- meta.proof.coq meta.proof.body.coq keyword.source.coq
  intros P Q [HP HQ].
//^^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  split.
//^^^^^ support.function.builtin.ltac
    - (* left *) apply HQ.
//               ^^^^^ support.function.builtin.ltac
//  ^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
    - (* right *) apply HP.  Qed.
//                ^^^^^ support.function.builtin.ltac
//    ^^^^^^^^^^^ meta.proof.coq
//                           ^^^ keyword.source.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq