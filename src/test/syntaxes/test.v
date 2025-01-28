// SYNTAX TEST "source.coq"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
//    ^^^^^^^^^ meta.proof.coq entity.name.function.theorem.coq
Proof.
// <----- meta.proof.coq keyword.source.coq
  intros A B HA HB. split.
  - apply HA.
//  ^^^^ meta.proof.coq support.function.builtin.ltac
  - apply HB.
//        ^^ meta.proof.coq
Qed.
//<--- keyword.source.coq

// -meta.proof.coq

Theorem and_commut : forall P Q : Prop,
//      ^^^^^^^^^^ meta.proof.coq entity.name.function.theorem.coq
  P /\ Q -> Q /\ P.
//     ^ meta.proof.coq
Proof.
  intros P Q [HP HQ].
  split.
    - (* left *) apply HQ.
    - (* right *) apply HP.  Qed.
//    ^^^^^^^^^^^ meta.proof.coq comment.block.coq
//                                ^ -meta.proof.coq
//                           ^^^ keyword.source.coq

Theorem ex_falso_quodlibet : forall (P:Prop), False -> P.
//      ^^^^^^^^^^^^^^^^^^ meta.proof.coq entity.name.function.theorem.coq
//                           ^^^^^^^^^^^^^^^^ meta.proof.coq
Proof.
  (* WORKED IN CLASS *)
  intros P contra.
  destruct contra.  Qed.