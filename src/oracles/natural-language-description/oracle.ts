import * as vscode from 'vscode';
import * as utils from '../../utils';
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
    const history = [];
    
    const { messages: goalDescriptionMessages, history: goalDescriptionHistory } = prompt1.render(goal);
    // console.log(utils.languageModelChatMessagesToString(goalDescriptionMessages));
    const goalDescriptionRawResponse = await this.model.sendRequest(goalDescriptionMessages, {}, cancellationToken);
    const goalDescriptionFragments = [];
    for await (const fragment of goalDescriptionRawResponse.text)
      goalDescriptionFragments.push(fragment);
    const goalDescriptionText = goalDescriptionFragments.join('');
    history.push(...goalDescriptionHistory, vscode.LanguageModelChatMessage.Assistant(goalDescriptionText));

    const { messages: proofNLMessages, history: proofNLHistory } = prompt2.render(history);
    // console.log(utils.languageModelChatMessagesToString(proofNLMessages));
    const proofNLRawResponse = await this.model.sendRequest(proofNLMessages, {}, cancellationToken);
    const proofNLFragments = [];
    for await (const fragment of proofNLRawResponse.text)
      proofNLFragments.push(fragment);
    const proofNLText = proofNLFragments.join('');
    history.push(...proofNLHistory, vscode.LanguageModelChatMessage.Assistant(proofNLText));

    const { messages: coqCodeMessages, history: coqCodeHistory } = prompt3.render(history);
    // console.log(utils.languageModelChatMessagesToString(coqCodeMessages));
    const coqCodeRawResponse = await this.model.sendRequest(coqCodeMessages, {}, cancellationToken);
    const coqCodeFragments = [];
    for await (const fragment of coqCodeRawResponse.text)
      coqCodeFragments.push(fragment);
    const coqCodeText = coqCodeFragments.join('');

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