// SYNTAX TEST "source.coq.proof"

Lemma add_is_valid (kind : IntegerKind.t) (z1 z2 z : Z)
// <----- meta.proof.coq meta.proof.head.coq meta.proof.head.keyword.coq - meta.proof.body.coq
//    ^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.name.coq - meta.proof.body.coq
      (H_z1 : Integer.Valid.t kind z1)
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.bind.coq - meta.proof.head.type.coq
      (H_z2 : Integer.Valid.t kind z2)
      (H_v :
        BinOp.Wrap.add (Value.Integer kind z1) (Value.Integer kind z2) =
        M.pure (Value.Integer kind z)
      ) :
      Integer.Valid.t kind z.
//    ^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq - meta.proof.head.name.coq meta.proof.body.coq
    Proof.
//  ^^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
      unfold
//    ^^^^^^ meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
        Integer.Valid.t,
//      ^^^^^^^^^^^^^^^^ meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
        BinOp.Wrap.add,
//      ^^^^^^^^^^^^^^^ meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
        BinOp.Wrap.make_arithmetic
//      ^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
        in *. (* Outside of meta.proof.body.tactic.coq *)
//      ^^^^^ meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
//            ^^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.body.tactic.coq
      rewrite IntegerKind.eqb_refl in H_v.
      simpl in H_v.
      injection H_v; clear H_v; intro H_v; rewrite <- H_v.
      apply Integer.normalize_wrap_is_valid.
    Qed. (* Outside of proof *)
//  ^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
//       ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

Lemma Forall_nth_error {A : Set} (P : A -> Prop) (l : list A) (n : nat)
// <----- meta.proof.coq meta.proof.head.coq meta.proof.head.keyword.coq - meta.proof.body.coq
//    ^^^^^^^^^^^^^^^^  meta.proof.head.name.coq 
//                      ^^^^^^^ meta.proof.head.bind.coq
//                                ^^^^^^^^^^^^^ meta.proof.head.bind.coq
//                                                ^^^^^^^^^^ meta.proof.head.bind.coq
//                                                             ^^^^^^^  meta.proof.head.bind.coq
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
      (H_l : List.Forall P l) :
    match List.nth_error l n with
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq
    | Some x => P x
//  ^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq
    | None => True
//  ^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq
    end.
//  ^^^ meta.proof.coq meta.proof.head.coq meta.proof.head.type.coq
  Proof.
//^^^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq - meta.proof.head.coq
    generalize dependent n.
    induction H_l  ; intros; destruct n; cbn; sfirstorder.
//  ^^^^^^^^^^^^^^^^ meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
  Qed.
//^^^^ meta.proof.coq meta.proof.body.coq meta.proof.body.tactic.coq meta.proof.body.executable.coq
