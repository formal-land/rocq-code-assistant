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

(* Lemma and_intro *) : forall A B : Prop, A -> B -> A /\ B.
// <--------------------- comment.block.coq - meta.proof.coq
//                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - comment.block.coq meta.proof.coq

(* 
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus. 
// <--------------------------------------------------------------------------------------- comment.block.coq - meta.comment.hint.coq meta.comment.examples.coq
Aenean quis vulputate libero, sit amet porta augue. Aenean vehicula non enim nec blandit.

@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.coq - meta.comment.hint.coq meta.comment.example.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.coq meta.comment.hint.coq - meta.comment.examples.coq 
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- meta.comment.hint.coq
@example Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <-------- comment.block.coq - meta.comment.example.coq meta.comment.hint.coq
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.coq meta.comment.example.coq  - meta.comment.hint.coq
Aenean quis vulputate libero, sit amet porta augue.
*)

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
// <--- - meta.comment.examples.coq
