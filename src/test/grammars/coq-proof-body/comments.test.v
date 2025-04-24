// SYNTAX TEST "source.coq.proof.body"

intros A B HA HB. split.
(**
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus. 
// <--------------------------------------------------------------------------------------- comment.block.rocq-code-assistant.coq - meta.comment.hint.coq meta.comment.examples.coq
Aenean quis vulputate libero, sit amet porta augue. Aenean vehicula non enim nec blandit.

@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.rocq-code-assistant.coq keyword.hint.coq - meta.comment.hint.coq meta.comment.example.coq meta.use.hint.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.rocq-code-assistant.coq meta.comment.hint.coq - meta.comment.examples.coq 
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- meta.comment.hint.coq
@example lorem#ipsum
// <-------- comment.block.rocq-code-assistant.coq keyword.example.coq - meta.comment.example.coq meta.comment.hint.coq
//       ^^^^^^^^^^^ meta.comment.example.coq - meta.comment.hint.coq meta.comment.use.coq
//       ^^^^^ meta.comment.example.path.coq
//             ^^^^^ meta.comment.example.name.coq
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- comment.block.rocq-code-assistant.coq meta.comment.example.coq - meta.comment.hint.coq
@example #ipsum
//        ^^^^^ meta.comment.example.name.coq - meta.comment.example.path.coq
@use lorem#ipsum
// <--- comment.block.rocq-code-assistant.coq keyword.use.coq - meta.comment.use.coq meta.comment.hint.coq
//   ^^^^^^^^^^^ meta.comment.use.coq - meta.comment.example.coq meta.comment.hint.coq
//   ^^^^^ meta.comment.use.path.coq
//         ^^^^^ meta.comment.use.name.coq
*)
admit.
// <----- - comment.block.coq comment.block.rocq-code-assistant.coq  meta.comment.hint.coq meta.comment.examples.coq
(**
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus. 
// <--------------------------------------------------------------------------------------- comment.block.rocq-code-assistant.coq - meta.comment.hint.coq meta.comment.examples.coq
Aenean quis vulputate libero, sit amet porta augue. Aenean vehicula non enim nec blandit.

@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.rocq-code-assistant.coq keyword.hint.coq - meta.comment.hint.coq meta.comment.example.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.rocq-code-assistant.coq meta.comment.hint.coq - meta.comment.examples.coq 
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- meta.comment.hint.coq
@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.rocq-code-assistant.coq keyword.hint.coq - meta.comment.example.coq meta.comment.hint.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.comment.hint.coq  - meta.comment.example.coq
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- comment.block.rocq-code-assistant.coq meta.comment.hint.coq - meta.comment.example.coq
*)
tactic.
tacitc.
(*
Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus. 
// <--------------------------------------------------------------------------------------- comment.block.coq -  comment.block.rocq-code-assistant.coq meta.comment.hint.coq meta.comment.examples.coq
Aenean quis vulputate libero, sit amet porta augue. Aenean vehicula non enim nec blandit.

@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.coq - comment.block.rocq-code-assistant.coq keyword.hint.coq meta.comment.hint.coq meta.comment.example.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.block.coq - comment.block.rocq-code-assistant.coq meta.comment.hint.coq meta.comment.examples.coq 
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- - comment.block.rocq-code-assistant.coq meta.comment.hint.coq
@hint Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ultricies laoreet faucibus.
// <----- comment.block.coq - comment.block.rocq-code-assistant.coq keyword.hint.coq meta.comment.example.coq meta.comment.hint.coq
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ - comment.block.rocq-code-assistant.coq meta.comment.hint.coq meta.comment.example.coq
Aenean quis vulputate libero, sit amet porta augue.
// <-------------------------------------------------- comment.block.coq - comment.block.rocq-code-assistant.coq meta.comment.hint.coq meta.comment.example.coq
*)
admit.