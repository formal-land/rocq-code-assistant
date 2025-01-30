// SYNTAX TEST "source.coq.proof"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
Proof.
  intros A B HA HB. split.
  - apply HA.
  (* Comment *) - apply HB.
//^^^^^^^^^^^^^ comment.block.coq
//              ^^^^^^^^^^^ - comment.block.coq
Qed.

(* Comment *)
// <------------- comment.block.coq

(* Lemma and_intro : forall A B : Prop, A -> B -> A /\ B. *)
// <-------------------------------------------------------------------- comment.block.coq - meta.proof.coq

(* Lemma and_intro : 
// ^^^^^^^^^^^^^^^^^ - meta.proof.coq
     forall A B : Prop, A -> B -> A /\ B. *)
//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq
// <-------------------------------------------- comment.block.coq - meta.proof.coq
