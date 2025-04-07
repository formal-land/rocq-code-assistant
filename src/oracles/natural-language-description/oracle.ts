import * as vscode from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as prompt1 from './prompt1';
import * as prompt2 from './prompt2';
import * as prompt3 from './prompt3';
import { Oracle, OracleParams } from '../types';

export class NaturalLanguageDescription implements Oracle {
  private model: vscode.LanguageModelChat;
  
  constructor(model: vscode.LanguageModelChat) {
    this.model = model;
  }

  async query(goal: Goal<PpString>, params?: OracleParams, cancellationToken?: vscode.CancellationToken) {
    const goalDescriptionMessages = prompt1.render(goal);

    const goalDescriptionRawResponse = await this.model.sendRequest(goalDescriptionMessages, {}, cancellationToken);
    
    const goalDescriptionFragments: string[] = [];
    for await (const fragment of goalDescriptionRawResponse.text)
      goalDescriptionFragments.push(fragment);
    const goalDescriptionText = goalDescriptionFragments.join('');

    // console.log(goalDescriptionText + '\n===========');

    const proofNLMessages = prompt2.render(goal, goalDescriptionText);

    const proofNLRawResponse = await this.model.sendRequest(proofNLMessages, {}, cancellationToken);

    const proofNLFragments: string[] = [];
    for await (const fragment of proofNLRawResponse.text)
      proofNLFragments.push(fragment);
    const proofNLText = proofNLFragments.join('');

    // console.log(proofNLText + '\n===========');

    const coqCodeMessages = prompt3.render(goal, proofNLText);

    const coqCodeRawResponse = await this.model.sendRequest(coqCodeMessages, {}, cancellationToken);
    const coqCodeFragments: string[] = [];
    for await (const fragment of coqCodeRawResponse.text)
      coqCodeFragments.push(fragment);
    const coqCodeText = coqCodeFragments.join('');

    // console.log(coqCodeText + '\n===========');

    const response = [];
    for (const match of coqCodeText.matchAll(/```coq(?<coqCode>[\s\S]*?)```/gm)) {
      let coqCode = match.groups?.coqCode;
      if (coqCode) {
        const proofBlockRegexRes = coqCode.match(/Proof\.(?<tactics>[\s\S]*)Qed\./m)?.groups;
        if (proofBlockRegexRes) // Response in Proof. ... Qed. block
          coqCode = proofBlockRegexRes.tactics;

        const qedRegexRes = coqCode.match(/(?<tactics>[\s\S]*)Qed\./m)?.groups;
        if (qedRegexRes) // Response ends in Qed.
          coqCode = qedRegexRes.tactics;

        response.push(coqCode);
      }
    }

    return response;
  }
}