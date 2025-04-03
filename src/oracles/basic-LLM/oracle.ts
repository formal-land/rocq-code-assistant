import * as vscode from 'vscode';
import * as utils from '../../utils';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as prompt from './prompt';
import { Oracle, OracleParams } from '../types';

export class BasicLLM implements Oracle {
  private model: vscode.LanguageModelChat;

  constructor(model: vscode.LanguageModelChat) {
    this.model = model;
  }

  async query(goal: Goal<PpString>, params?: OracleParams, cancellationToken?: vscode.CancellationToken) {
    const messages = prompt.render(goal, params);

    // console.log(utils.languageModelChatMessagesToString(messages));

    const rawResponse = await this.model.sendRequest(messages, {}, cancellationToken);
    
    const fragments: string[] = [];
    for await (const fragment of rawResponse.text)
      fragments.push(fragment);
    const rawResponseText = fragments.join('');

    const response = [];
    for (const match of rawResponseText.matchAll(/```coq(?<coqCode>[\s\S]*?)```/gm)) {
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
