import * as vscode from 'vscode';
import * as fsp from 'fs/promises';
import { Token } from './tokenizer';
import { Tokenizer } from '../syntax/tokenizer';
import { Name, Scope } from './scope';

export async function extractProofTokensFromName(proofName: string, filePath: string) {
  const fileText = await fsp.readFile(filePath, 'utf8');
  const tokens = await Tokenizer.get().tokenize(fileText, Scope.PROOF);
  
  const nameToken = tokens.find(token => 
    token.scopes.includes(Name.PROOF) &&
    token.scopes.includes(Name.PROOF_NAME) &&
    token.value === proofName.trim());

  if (nameToken === undefined) return undefined;
  else return extractProofTokensAroundToken(nameToken, tokens);
}

export async function extractProofTokensFromPosition(position: vscode.Position, filePath: string) {
  const fileText = await fsp.readFile(filePath, 'utf8');
  const tokens = await Tokenizer.get().tokenize(fileText, Scope.PROOF);

  const selectionToken = tokens.find(token =>
    token.range.contains(position) &&
    token.scopes.includes(Name.PROOF));

  if (selectionToken === undefined) return undefined;
  else return extractProofTokensAroundToken(selectionToken, tokens);
}

function extractProofTokensAroundToken(baseToken: Token, tokens: Token[]) {
  const extractedTokens = [];

  const baseTokenIdx = tokens.indexOf(baseToken);

  const firstProofTokenIdx = tokens.findLastIndex((token, idx) => 
    idx <= baseTokenIdx && 
    !token.scopes.includes(Name.PROOF)) + 1;

  let lastProofTokenIdx = tokens.findIndex((token, idx) => 
    idx >= baseTokenIdx && 
    !token.scopes.includes(Name.PROOF)) - 1;
  if (lastProofTokenIdx < 0) lastProofTokenIdx = tokens.length - 1;

  const lastCommentTokenIdx = tokens.findLastIndex((token, idx) =>
    idx <= firstProofTokenIdx &&
    token.scopes.includes(Name.COMMENT));

  const firstCommentTokenIdx = tokens.findLastIndex((token, idx) =>
    idx <= lastCommentTokenIdx &&
    !token.scopes.includes(Name.COMMENT)) + 1;

  const existsAssociatedComment = !tokens.some((token, idx) =>
    idx > lastCommentTokenIdx &&
    idx < firstProofTokenIdx &&
    token.value !== '');

  if (existsAssociatedComment)
    extractedTokens.push(...tokens.slice(firstCommentTokenIdx, lastCommentTokenIdx + 1));
  extractedTokens.push(...tokens.slice(firstProofTokenIdx, lastProofTokenIdx + 1));

  return extractedTokens;
}