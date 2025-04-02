export const enum Scope {
  PROOF = 'source.coq.proof',
  PROOF_BODY = 'source.coq.proof.body'
}

export const enum Name {
  PROOF = 'meta.proof.coq',
  PROOF_HEAD = 'meta.proof.head.coq',
  PROOF_BODY = 'meta.proof.body.coq',
  PROOF_TOKEN = 'meta.proof.head.keyword.coq',
  PROOF_NAME = 'meta.proof.head.name.coq',
  PROOF_BIND = 'meta.proof.head.bind.coq',
  PROOF_TYPE = 'meta.proof.head.type.coq',
  COMMENT = 'comment.block.coq',
  TACTIC = 'meta.proof.body.tactic.coq',
  ADMIT = 'meta.proof.body.tactic.admit.coq',
  FOCUSING_CONSTRUCT = 'meta.proof.body.focus.coq',
  EXECUTABLE = 'meta.proof.body.executable.coq'
}