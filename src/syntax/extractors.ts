import * as vscode from 'vscode';
import { Name } from './scope';
import { Token } from './tokenizer';

export function extractProofTokensFromName(proofName: string, tokens: Token[]) {
  const nameToken = tokens.find(token => 
    token.scopes.includes(Name.PROOF) &&
    token.scopes.includes(Name.PROOF_NAME) &&
    token.value === proofName.trim());

  if (nameToken === undefined) return undefined;
  else return extractProofTokensAroundToken(nameToken, tokens);
}

export function extractProofTokensFromPosition(position: vscode.Position, tokens: Token[]) {
  const selectionToken = tokens.find(token =>
    token.range.contains(position) &&
    token.scopes.includes(Name.PROOF));

  if (selectionToken === undefined) return undefined;
  else return extractProofTokensAroundToken(selectionToken, tokens);
}

function extractProofTokensAroundToken(baseToken: Token, tokens: Token[]) {
  const baseTokenIdx = tokens.indexOf(baseToken);

  const firstProofTokenIdx = tokens.findLastIndex((token, idx) => 
    idx <= baseTokenIdx && 
    !token.scopes.includes(Name.PROOF)) + 1;

  const lastProofTokenIdx = tokens.findIndex((token, idx) => 
    idx >= baseTokenIdx && 
    !token.scopes.includes(Name.PROOF)) - 1;

  return tokens.slice(firstProofTokenIdx, lastProofTokenIdx + 1);
}