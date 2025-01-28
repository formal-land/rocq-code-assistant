// SYNTAX TEST "source.coq"

Lemma and_intro : forall A B : Prop, A -> B -> A /\ B.
//    ^^^^^^^^^ theorem entity.name.function.theorem.coq
Proof.
//<----- theorem keyword.source.coq
  intros A B HA HB. split.
  - apply HA.
  - apply HB.
Qed.