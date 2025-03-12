import { ProofMeta } from './proof';
import { Oracle } from './oracles/types';
import { Tokenizer } from './syntax/tokenizer';
import { Scope } from './syntax/scope';
import { Prettier } from './syntax/prettier/prettier';

export async function search(proof: ProofMeta, oracles: Oracle[], prettier: Prettier) {
  const goals = await proof.goals();

  await Promise.all(
    goals.map(async (goal, idx) => {
      const answer = await oracles[0].query(goal);
      const tactics = await Tokenizer.get().tokenize(answer, Scope.PROOF_BODY);
      return proof.insert(tactics, idx, false);
    })
  );

  console.log(await prettier.pp(proof.toString()));
}