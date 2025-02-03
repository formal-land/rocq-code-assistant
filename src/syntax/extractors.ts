import * as vsctm from 'vscode-textmate';
import * as vscode from 'vscode';
import * as utils from '../utils';
import { ProofMeta } from './syntaxes/coq-proof';

export function extractProofFromName(proofName: string, textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]) {
  const firstLineIdx = utils.zip(textLines, tokenizedLines).findIndex(([textLine, tokenizedLine]) => 
    tokenizedLine.tokens.some(token =>
      token.scopes.includes('meta.proof.coq') &&
      token.scopes.includes('entity.name.function.theorem.coq') &&
      tokenText(token, textLine) === proofName.trim()
    )
  );

  if (firstLineIdx === -1) 
    return undefined; // Proof not found

  const lastLineIdx = tokenizedLines.findIndex((tokenizedLine, idx) =>
    idx >= firstLineIdx && 
    (idx === tokenizedLines.length - 1 || 
     tokenizedLine.tokens.every(token => !token.scopes.includes('meta.proof.coq')))
  );

  return proofFromTokenizedProofLines(
    textLines.slice(firstLineIdx, lastLineIdx),
    tokenizedLines.slice(firstLineIdx, lastLineIdx)
  );
}

export function extractProofAtPosition(position: vscode.Position, textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]) {
  if (!tokenizedLines[position.line].tokens.some(token => token.scopes.includes('meta.proof.coq')))
    return undefined; // Not in proof

  let firstLineIdx = tokenizedLines.findLastIndex((tokenizedLine, idx) => 
    idx <= position.line &&
    !tokenizedLine.tokens.some(token => token.scopes.includes('meta.proof.coq'))
  ) + 1;

  const lastLineIdx = tokenizedLines.findIndex((tokenizedLine, idx) =>
    idx >= firstLineIdx && 
    (idx === tokenizedLines.length - 1 || 
     tokenizedLine.tokens.every(token => !token.scopes.includes('meta.proof.coq')))
  );

  return proofFromTokenizedProofLines(
    textLines.slice(firstLineIdx, lastLineIdx),
    tokenizedLines.slice(firstLineIdx, lastLineIdx)
  );
}

function proofFromTokenizedProofLines(textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]): ProofMeta {
  const keyword = tokenizedLines
    .flatMap((tokenizedLine, idx) => 
      tokenizedLine.tokens
        .filter(token => token.scopes.includes('keyword.function.theorem.coq'))
        .map(token => tokenText(token, textLines[idx])))
    .join(' ');
  
  const name = tokenizedLines
    .flatMap((tokenizedLine, idx) => 
      tokenizedLine.tokens
        .filter(token => token.scopes.includes('entity.name.function.theorem.coq'))
        .map(token => tokenText(token, textLines[idx])))
    .join(' ');

  const type = tokenizedLines
    .flatMap((tokenizedLine, idx) => 
      tokenizedLine.tokens
        .filter(token => token.scopes.includes('storage.type.function.theorem.coq'))
        .map(token => tokenText(token, textLines[idx])))
    .join(' ');

  const body = tokenizedLines
    .map((tokenizedLine, idx) => 
      tokenizedLine.tokens
        .filter(token => token.scopes.includes('meta.proof.body.coq'))
        .map(token => tokenText(token, textLines[idx]))
        .join(' '))
    .filter(textLine => textLine.length !== 0)
    .join('\n');

  const admits = tokenizedLines
    .flatMap((tokenizedLine, idx) => 
      tokenizedLine.tokens
        .filter(token => 
          token.scopes.includes('invalid.illegal.admit.coq') && 
          tokenText(token, textLines[idx]) === 'admit')
        .map(token => new vscode.Range(idx, token.startIndex, idx, token.endIndex)));
  
  return { keyword, name, type, body, admits };
}

function tokenText(token: vsctm.IToken, textLine: string) {
  return textLine.substring(token.startIndex, token.endIndex).trim();
}