// SYNTAX TEST "source.coq.proof.body"

intros A B HA HB. split.
(*
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus. 
// <--------------------------------------------------------------------------------------- comment.block.coq - meta.comment.hint.coq meta.comment.examples.coq
Aenean quis vulputate libero, sit amet porta augue. Aenean vehicula non enim nec blandit.

@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.coq keyword.hint.coq - meta.comment.hint.coq meta.comment.example.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.coq meta.comment.hint.coq - meta.comment.examples.coq 
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- meta.comment.hint.coq
@example Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <-------- comment.block.coq keyword.example.coq - meta.comment.example.coq meta.comment.hint.coq
//       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.comment.example.coq  - meta.comment.hint.coq
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- comment.block.coq meta.comment.example.coq - meta.comment.hint.coq
*)
admit.
// <----- - comment.block.coq meta.comment.hint.coq meta.comment.examples.coq
(*
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus. 
// <--------------------------------------------------------------------------------------- comment.block.coq - meta.comment.hint.coq meta.comment.examples.coq
Aenean quis vulputate libero, sit amet porta augue. Aenean vehicula non enim nec blandit.

@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.coq keyword.hint.coq - meta.comment.hint.coq meta.comment.example.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.coq meta.comment.hint.coq - meta.comment.examples.coq 
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- meta.comment.hint.coq
@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.coq keyword.hint.coq - meta.comment.example.coq meta.comment.hint.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.comment.hint.coq  - meta.comment.example.coq
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- comment.block.coq meta.comment.hint.coq - meta.comment.example.coq
*)
tactic.
tacitc.
admit.