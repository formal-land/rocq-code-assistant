// SYNTAX TEST "source.coq.proof"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
// <----- meta.proof.coq meta.proof.head.coq keyword.function.theorem.coq - meta.proof.body.coq
//    ^^^^^^^^^ entity.name.function.theorem.coq
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ storage.type.function.theorem.coq - entity.name.function.theorem.coq
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
  intros A B HA HB. split.
//^^^^^^^^^^^^^^^^^ tactic
//                  ^^^^^^ tactic
//^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq - meta.proof.head.coq
  - apply HA.
//^ - tactic
//  ^^^^^^^^^ tactic
//^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq - meta.proof.head.coq
  - apply HB.
//^ - tactic
//  ^^^^^^^^^ tactic
//^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq - meta.proof.head.coq
Qed. (* Outside of proof *)
// <---- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
//   ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

Theorem ex_falso_quodlibet : forall (P : Prop), False -> P.
// <----- meta.proof.coq meta.proof.head.coq keyword.function.theorem.coq - meta.proof.body.coq
//      ^^^^^^^^^^^^^^^^^^ entity.name.function.theorem.coq
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ storage.type.function.theorem.coq - entity.name.function.theorem.coq
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
  intros P contra.
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq tactic
  destruct contra.  Qed. (* Outside of proof *)
//                  ^^^ - meta.proof.body.coq
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq tactic
//                       ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

Theorem
// <------- meta.proof.coq meta.proof.head.coq keyword.function.theorem.coq - meta.proof.body.coq
  and_commut : forall P Q : Prop,
//^^^^^^^^^^ entity.name.function.theorem.coq
//             ^^^^^^^^^^^^^^^^^^ storage.type.function.theorem.coq - entity.name.function.theorem.coq
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq 
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq - meta.proof.body.coq entity.name.function.theorem.coq
Proof.
//<----- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
  intros P Q [HP HQ].
//^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  split.
//^^^^^^ tactic
    - (* left *) apply HQ   .
//  ^ - tactic
//    ^^^^^^^^^^ comment.block.coq
//               ^^^^^^^^^^^^ tactic
//  ^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
    - (* right *) apply HP.  Qed.
//  ^ - tactic
//    ^^^^^^^^^^^ meta.proof.coq
//                ^^^^^^^^^ tactic
//                           ^^^ - meta.proof.body.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.body.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq
(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

Lemma and_intro (A B : Prop) : A -> B -> A /\ B.
//               ^^^^^^^^^^ variable.paramter.function.theorem.coq
Proof.
  intros A B HA HB. split.
  { admit. }
//  ^^^^^^ meta.proof.coq meta.proof.body.coq tactic
  { admit. }
//  ^^^^^^ meta.proof.coq meta.proof.body.coq tactic
Admitted.
// <-------- meta.proof.coq - meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Theorem and_commut :
// <------- meta.proof.coq meta.proof.head.coq keyword.function.theorem.coq - meta.proof.body.coq
//      ^^^^^^^^^^ entity.name.function.theorem.coq
//^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq 
  forall P Q : Prop,
//^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq - meta.proof.body.coq entity.name.function.theorem.coq
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq - meta.proof.body.coq entity.name.function.theorem.coq
(* Inside of proof *)
// <--------------------- meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
Proof.
(* Inside of proof body *)
// <-------------------------- meta.proof.coq meta.proof.body.coq