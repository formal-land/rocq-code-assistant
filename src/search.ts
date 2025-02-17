import { LanguageClient } from 'vscode-languageclient/node';
import { ProofMeta } from './syntax/proof';
import { Oracle } from './oracles/oracle';
import { PetState } from './lib/coq-lsp/types';
import { Request } from './coq-lsp-client';

export async function search(proof: ProofMeta, coqLSPClient: LanguageClient, oracles: Oracle[]) {
  const sState = await coqLSPClient.sendRequest(Request.Petanque.start, { uri: proof.uri, thm: proof.name, pre_commands: null });
  _search(proof, coqLSPClient, sState, oracles);
}

async function _search(proof: ProofMeta, coqLSPClient: LanguageClient, sState: PetState, oracles: Oracle[]) {
  const { status, message, goal, state } = await proof.check(coqLSPClient, sState);
}