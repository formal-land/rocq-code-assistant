import * as vscode from 'vscode';
import { ProofMeta } from './proof';
import { Name } from './const';
import { Token } from './tokenizer';

export function extractProofFromName(uri: string, proofName: string, tokens: Token[]) {
  const nameToken = tokens.find(token => 
    token.scopes.includes(Name.PROOF) &&
    token.scopes.includes(Name.PROOF_NAME) &&
    token.value === proofName.trim());

  if (nameToken === undefined) return undefined;
  else return extractProofAroundToken(uri, nameToken, tokens);
}

export function extractProofAtPosition(uri: string, position: vscode.Position, tokens: Token[]) {
  const selectionToken = tokens.find(token =>
    token.range.contains(position) &&
    token.scopes.includes(Name.PROOF));

  if (selectionToken === undefined) return undefined;
  else return extractProofAroundToken(uri, selectionToken, tokens);
}

function extractProofAroundToken(uri: string, baseToken: Token, tokens: Token[]) {
  const baseTokenIdx = tokens.indexOf(baseToken);

  const firstProofTokenIdx = tokens.findLastIndex((token, idx) => 
    idx <= baseTokenIdx && 
    !token.scopes.includes(Name.PROOF)) + 1;

  const lastProofTokenIdx = tokens.findIndex((token, idx) => 
    idx >= baseTokenIdx && 
    !token.scopes.includes(Name.PROOF)) - 1;

  return proofFromTokens(uri, tokens.slice(firstProofTokenIdx, lastProofTokenIdx + 1));
}

async function proofFromTokens(uri: string, tokens: Token[]) {
  tokens = tokens
    .filter(token => 
      !token.scopes.includes(Name.COMMENT) && 
      token.value !== '');

  const keyword = tokens
    .filter(token => token.scopes.includes(Name.PROOF_TOKEN))
    .map(token => token.value)
    .join(' ');

  const name = tokens
    .filter(token => token.scopes.includes(Name.PROOF_NAME))
    .map(token => token.value)
    .join(' ');

  const type = tokens
    .filter(token => token.scopes.includes(Name.PROOF_TYPE))
    .map(token => token.value)
    .join(' ');

  const body = tokens
    .filter(token => token.scopes.includes(Name.PROOF_BODY));

  const location = new vscode.Range(
    tokens[0].range.start.line, 
    tokens[0].range.start.character, 
    tokens[tokens.length - 1].range.end.line, 
    tokens[tokens.length - 1].range.end.character);

  const admitsLocations = tokens
    .filter(token => 
      token.scopes.includes(Name.TACTIC))
    .map(token => token.range);
  
  const proofMeta = await ProofMeta.init(uri, keyword, name, type, location, admitsLocations);
  await proofMeta.body.insert(body);

  return proofMeta;
}