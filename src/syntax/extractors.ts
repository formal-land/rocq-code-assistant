import * as vsctm from 'vscode-textmate';
import * as vscode from 'vscode';
import * as utils from '../utils';

export function extractProofFromName(proofName: string, textLines: string[], tokenizedLines: vsctm.ITokenizeLineResult[]) {
  const firstLineIdx = utils.zip(textLines, tokenizedLines).findIndex(([textLine, tokenizedLine]) => 
    tokenizedLine.tokens.some(token =>
      token.scopes.includes('meta.proof.coq') &&
      token.scopes.includes('entity.name.function.theorem.coq') &&
      textLine.substring(token.startIndex, token.endIndex).trim() === proofName.trim()
    )
  );

  if (firstLineIdx === -1) 
    return undefined; // Proof not found

  const lastLineIdx = tokenizedLines.findIndex((tokenizedLine, idx) =>
    idx >= firstLineIdx && 
    (idx === tokenizedLines.length - 1 || 
     tokenizedLine.tokens.every(token => !token.scopes.includes('meta.proof.coq')))
  );

  return textLines.slice(firstLineIdx, lastLineIdx).join('\n');
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

  return textLines.slice(firstLineIdx, lastLineIdx).join('\n');
}