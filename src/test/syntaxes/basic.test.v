// SYNTAX TEST "source.coq.proof"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
// <----- meta.proof.coq keyword.source.coq - meta.proof.body.coq
//    ^^^^^^^^^ entity.name.function.theorem.coq
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ storage.type.function.theorem.coq - entity.name.function.theorem.coq
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq keyword.source.coq -meta.proof.body.coq
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
// <---- meta.proof.coq - meta.proof.body.coq
//   ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Theorem ex_falso_quodlibet : forall (P : Prop), False -> P.
// <----- meta.proof.coq keyword.source.coq - meta.proof.body.coq
//      ^^^^^^^^^^^^^^^^^^ entity.name.function.theorem.coq
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ storage.type.function.theorem.coq - entity.name.function.theorem.coq
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq keyword.source.coq - meta.proof.body.coq
  intros P contra.
//^^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  destruct contra.  Qed. (* Outside of proof *)
//^^^^^^^^ support.function.builtin.ltac
//                  ^^^ keyword.source.coq - meta.proof.body.coq
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
//                       ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Theorem
// <------- meta.proof.coq keyword.source.coq - meta.proof.body.coq
  and_commut : forall P Q : Prop,
//^^^^^^^^^^ entity.name.function.theorem.coq
//             ^^^^^^^^^^^^^^^^^^ storage.type.function.theorem.coq - entity.name.function.theorem.coq
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq 
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^ meta.proof.coq storage.type.function.theorem.coq - meta.proof.body.coq entity.name.function.theorem.coq
Proof.
//<----- meta.proof.coq keyword.source.coq - meta.proof.body.coq
  intros P Q [HP HQ].
//^^^^^^ support.function.builtin.ltac
//^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  split.
//^^^^^ support.function.builtin.ltac
    - (* left *) apply HQ.
//               ^^^^^ support.function.builtin.ltac
//    ^^^^^^^^^^ comment.block.coq
//  ^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
    - (* right *) apply HP.  Qed.
//                ^^^^^ support.function.builtin.ltac
//    ^^^^^^^^^^^ meta.proof.coq
//                           ^^^ keyword.source.coq - meta.proof.body.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.body.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq
(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
Proof.
  intros A B HA HB. split.
  { admit. }
//  ^^^^^ meta.proof.coq meta.proof.body.coq invalid.illegal.admit.coq 
  { admit. }
//  ^^^^^ meta.proof.coq meta.proof.body.coq invalid.illegal.admit.coq
Admitted.
// <-------- meta.proof.coq invalid.illegal.admit.coq - meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Theorem and_commut :
// <------- meta.proof.coq keyword.source.coq - meta.proof.body.coq
//      ^^^^^^^^^^ entity.name.function.theorem.coq
//^^^^^^^^^^^^^^^^^^ meta.proof.coq - meta.proof.body.coq 
  forall P Q : Prop,
//^^^^^^^^^^^^^^^^^^ meta.proof.coq storage.type.function.theorem.coq - meta.proof.body.coq entity.name.function.theorem.coq
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^ meta.proof.coq storage.type.function.theorem.coq - meta.proof.body.coq entity.name.function.theorem.coq
(* Inside of proof *)
// <--------------------- meta.proof.coq - meta.proof.body.coq
Proof.
(* Inside of proof body *)
// <-------------------------- meta.proof.coq meta.proof.body.coq