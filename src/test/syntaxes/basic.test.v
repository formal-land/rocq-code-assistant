// SYNTAX TEST "source.coq.proof"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
// <----- meta.proof.coq meta.proof.head.coq meta.proof.head.keyword.coq - meta.proof.body.coq
//    ^^^^^^^^^ meta.proof.head.name.coq
//                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.head.type.coq - meta.proof.head.name.coq
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
  intros A B HA HB. split.
//^^^^^^^^^^^^^^^^^ meta.proof.body.tactic.coq
//                  ^^^^^^ meta.proof.body.tactic.coq
//^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq - meta.proof.head.coq
  - apply HA.
//^ - meta.proof.body.tactic.coq
//  ^^^^^^^^^ meta.proof.body.tactic.coq
//^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq - meta.proof.head.coq
  - apply HB.
//^ - meta.proof.body.tactic.coq
//  ^^^^^^^^^ meta.proof.body.tactic.coq
//^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq - meta.proof.head.coq
Qed. (* Outside of proof *)
// <---- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
//   ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

Theorem ex_falso_quodlibet : forall (P : Prop), False -> P.
// <----- meta.proof.coq meta.proof.head.coq meta.proof.head.keyword.coq - meta.proof.body.coq
//      ^^^^^^^^^^^^^^^^^^ meta.proof.head.name.coq
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.head.type.coq - meta.proof.head.name.coq
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
Proof.
//<----- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
  intros P contra.
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq
  destruct contra.  Qed. (* Outside of proof *)
//                  ^^^ - meta.proof.body.coq
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq
//                       ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

Theorem
// <------- meta.proof.coq meta.proof.head.coq meta.proof.head.keyword.coq - meta.proof.body.coq
  and_commut : forall P Q : Prop,
//^^^^^^^^^^ meta.proof.head.name.coq
//             ^^^^^^^^^^^^^^^^^^ meta.proof.head.type.coq - meta.proof.head.name.coq
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq 
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq - meta.proof.body.coq meta.proof.head.name.coq
Proof.
//<----- meta.proof.coq - meta.proof.body.coq meta.proof.head.coq
  intros P Q [HP HQ].
//^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
  split.
//^^^^^^ meta.proof.body.tactic.coq
    - (* left *) apply HQ   .
//  ^ - meta.proof.body.tactic.coq
//    ^^^^^^^^^^ comment.block.coq
//               ^^^^^^^^^^^^ meta.proof.body.tactic.coq
//  ^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.body.coq
    - (* right *) apply HP.  Qed.
//  ^ - meta.proof.body.tactic.coq
//    ^^^^^^^^^^^ meta.proof.coq
//                ^^^^^^^^^ meta.proof.body.tactic.coq
//                           ^^^ - meta.proof.body.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.body.coq
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq
(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq meta.proof.head.coq

Lemma and_intro (A B : Prop) : A -> B -> A /\ B.
//               ^^^^^^^^^^ meta.proof.head.bind.coq
Proof.
  intros A B HA HB. split.
  { admit. }
//  ^^^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.tactic.admit.coq
  { admit  . }
//  ^^^^^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.tactic.admit.coq
Admitted.
// <-------- meta.proof.coq - meta.proof.body.coq

(* Outside of proof *)
// <---------------------- - meta.proof.coq meta.proof.body.coq

Theorem and_commut :
// <------- meta.proof.coq meta.proof.head.coq meta.proof.head.keyword.coq - meta.proof.body.coq
//      ^^^^^^^^^^ meta.proof.head.name.coq
//^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq 
  forall P Q : Prop,
//^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq - meta.proof.body.coq meta.proof.head.name.coq
  P /\ Q -> Q /\ P.
//^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq - meta.proof.body.coq meta.proof.head.name.coq
(* Inside of proof *)
// <--------------------- meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
Proof.
(* Inside of proof body *)
// <-------------------------- meta.proof.coq meta.proof.body.coq