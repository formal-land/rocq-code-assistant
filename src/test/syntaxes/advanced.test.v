// SYNTAX TEST "source.coq.proof"

Lemma add_is_valid (kind : IntegerKind.t) (z1 z2 z : Z)
// <----- meta.proof.coq meta.proof.head.coq keyword.source.coq - meta.proof.body.coq
//    ^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq entity.name.function.theorem.coq - meta.proof.body.coq
      (H_z1 : Integer.Valid.t kind z1)
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq variable.paramter.function.theorem.coq - storage.type.function.theorem.coq
      (H_z2 : Integer.Valid.t kind z2)
      (H_v :
        BinOp.Wrap.add (Value.Integer kind z1) (Value.Integer kind z2) =
        M.pure (Value.Integer kind z)
      ) :
      Integer.Valid.t kind z.
//    ^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq - entity.name.function.theorem.coq meta.proof.body.coq
    Proof.
//  ^^^^^ meta.proof.coq keyword.source.coq - meta.proof.body.coq
      unfold
//    ^^^^^^ meta.proof.body.coq
        Integer.Valid.t,
        BinOp.Wrap.add,
        BinOp.Wrap.make_arithmetic
        in *.
      rewrite IntegerKind.eqb_refl in H_v.
      simpl in H_v.
      injection H_v; clear H_v; intro H_v; rewrite <- H_v.
      apply Integer.normalize_wrap_is_valid.
    Qed. (* Outside of proof *)
//  ^^^ keyword.source.coq
//  ^^^ meta.proof.coq - meta.proof.body.coq
//       ^^^^^^^^^^^^^^^^^^^^^^ - meta.proof.coq meta.proof.body.coq

Lemma Forall_nth_error {A : Set} (P : A -> Prop) (l : list A) (n : nat)
// <----- meta.proof.coq meta.proof.head.coq keyword.source.coq - meta.proof.body.coq
//    ^^^^^^^^^^^^^^^^  entity.name.function.theorem.coq 
//                      ^^^^^^^ variable.paramter.function.theorem.coq
//                                ^^^^^^^^^^^^^ variable.paramter.function.theorem.coq
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq - meta.proof.body.coq
      (H_l : List.Forall P l) :
    match List.nth_error l n with
//  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq
    | Some x => P x
//  ^^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq
    | None => True
//  ^^^^^^^^^^^^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq
    end.
//  ^^^ meta.proof.coq meta.proof.head.coq storage.type.function.theorem.coq
  Proof.
    generalize dependent n.
    induction H_l; intros; destruct n; cbn; sfirstorder.
  Qed.
