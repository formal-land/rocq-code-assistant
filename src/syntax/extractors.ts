import * as vsctm from 'vscode-textmate';
import * as vscode from 'vscode';
import { ProofMeta } from './coq-proof';

export function extractProofFromName(uri: string, proofName: string, textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]) {
  const tokens = flatTokens(tokenizedLines);

  const nameToken = tokens.find(([token, lineIdx]) => 
    token.scopes.includes('meta.proof.coq') &&
    token.scopes.includes('meta.proof.head.name.coq') &&
    tokenText([token, lineIdx], textLines) === proofName.trim());

  if (nameToken === undefined)
    return undefined;

  return extractProofAroundToken(uri, nameToken, textLines, tokens);
}

export function extractProofAtPosition(uri: string, position: vscode.Position, textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]) {
  const tokens = flatTokens(tokenizedLines);

  const selectionToken = tokens.find(([token, lineIdx]) =>
    position.line === lineIdx &&
    position.character >= token.startIndex &&
    position.character <= token.endIndex &&
    token.scopes.includes('meta.proof.coq'));

  if (selectionToken === undefined)
    return undefined;

  return extractProofAroundToken(uri, selectionToken, textLines, tokens);
}

function extractProofAroundToken(uri: string, baseToken: [vsctm.IToken, number], textLines: string[], tokens: [vsctm.IToken, number][]) {
  const baseTokenIdx = tokens.indexOf(baseToken);

  const firstProofTokenIdx = tokens.findLastIndex(([token, ], idx) => 
    idx <= baseTokenIdx && 
    !token.scopes.includes('meta.proof.coq')) + 1;

  const lastProofTokenIdx = tokens.findIndex(([token, ], idx) => 
    idx >= baseTokenIdx && 
    !token.scopes.includes('meta.proof.coq')) - 1;

  return proofFromTokens(uri, textLines, tokens.slice(firstProofTokenIdx, lastProofTokenIdx + 1));
}

function flatTokens(tokenizedLines: vsctm.ITokenizeLineResult[]) {
  return tokenizedLines.flatMap<[vsctm.IToken, number]>((tokenizedLine, lineIdx) => 
    tokenizedLine.tokens.map<[vsctm.IToken, number]>(token => [token, lineIdx])
  );
}

function proofFromTokens(uri: string, textLines: string[], tokens: [vsctm.IToken, number][]): ProofMeta {
  tokens = tokens
    .filter(([token, lineIdx]) => 
      !token.scopes.includes('comment.block.coq') && 
      !(tokenText([token, lineIdx], textLines) === ''));

  const keyword = tokens
    .filter(([token, ]) => token.scopes.includes('meta.proof.head.keyword.coq'))
    .map(token => tokenText(token, textLines))
    .join(' ');

  const name = tokens
    .filter(([token, ]) => token.scopes.includes('meta.proof.head.name.coq'))
    .map(token => tokenText(token, textLines))
    .join(' ');

  const type = tokens
    .filter(([token, ]) => token.scopes.includes('meta.proof.head.type.coq'))
    .map(token => tokenText(token, textLines))
    .join(' ');

  const body = tokens
    .filter(([token, ]) => token.scopes.includes('meta.proof.body.coq'))
    .map(token => ({ token: tokenText(token, textLines), tags: token[0].scopes }));

  const admitsLocations = tokens
    .filter(([token, ]) => 
      token.scopes.includes('meta.proof.body.tactic.admit.coq'))
    .map(([token, lineIdx]) => new vscode.Range(lineIdx, token.startIndex, lineIdx, token.endIndex));

  const location = new vscode.Range(
    tokens[0][1], tokens[0][0].startIndex, 
    tokens[tokens.length - 1][1], tokens[tokens.length - 1][0].endIndex);
  
  return new ProofMeta(keyword, name, type, body, uri, location, admitsLocations);
}

function tokenText([token, lineIdx]: [vsctm.IToken, number], textLines: string[]) {
  return textLines[lineIdx].substring(token.startIndex, token.endIndex).trim();
}