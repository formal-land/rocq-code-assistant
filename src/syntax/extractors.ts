import * as vsctm from 'vscode-textmate';
import * as vscode from 'vscode';
import * as utils from '../utils';
import { Proof } from './syntaxes/coq-proof';

export function extractProofFromName(proofName: string, textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]) {
  const firstLineIdx = utils.zip(textLines, tokenizedLines).findIndex(([textLine, tokenizedLine]) => 
    tokenizedLine.tokens.some(token =>
      token.scopes.includes('meta.proof.coq') &&
      token.scopes.includes('entity.name.function.theorem.coq') &&
      tokenText(textLine, token) === proofName.trim()
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

function tokenText(textLine: string, token: vsctm.IToken) {
  return textLine.substring(token.startIndex, token.endIndex).trim();
}

function proofFromTokenizedProofLines(textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]): Proof {
  const tokens: [vsctm.IToken, number][] = tokenizedLines
    .map((line, idx) => line.tokens.map<[vsctm.IToken, number]>(token => [token, idx]))
    .flat(1);

  const name = tokens
    .filter(([token, ]) => token.scopes.includes('entity.name.function.theorem.coq'))
    .map(([token, line]) => tokenText(textLines[line], token))
    .join(' ');

  const type = tokens
    .filter(([token, ]) => token.scopes.includes('storage.type.function.theorem.coq'))
    .map(([token, line]) => tokenText(textLines[line], token))
    .join(' ');

  const body = tokens
    .filter(([token, ]) => token.scopes.includes('meta.proof.body.coq'))
    .map(([token, line]) => tokenText(textLines[line], token))
    .join(' ');

  return { name, type, body };
}