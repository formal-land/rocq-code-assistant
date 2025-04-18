import * as vscode from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as utils from '../../utils';
import * as prompt from './prompt';
import { Oracle } from '../oracle';

export class BasicLLM extends Oracle {
  async query(goal: Goal<PpString>, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    const messages = prompt.render(goal, params);
    const rawResponse = await this.model.sendRequest(messages, cancellationToken);
    
    const rawResponseText = utils.languageModelChatMessagesToString([rawResponse]);
    const response = this.parseResponse(rawResponseText);

    return {
      response: response ? [response] : [],
      repair: (params: Oracle.Params) => {
        return this.query(goal, params, cancellationToken);
      }
    };
  }

  parseResponse(response: string) {
    for (const match of response.matchAll(/```coq(?<coqCode>[\s\S]*?)```/gm)) {
      let coqCode = match.groups?.coqCode;
      if (coqCode) {
        const proofBlockRegexRes = coqCode.match(/Proof\.(?<tactics>[\s\S]*)Qed\./m)?.groups;
        if (proofBlockRegexRes) // Response in Proof. ... Qed. block
          coqCode = proofBlockRegexRes.tactics;

        const qedRegexRes = coqCode.match(/(?<tactics>[\s\S]*)Qed\./m)?.groups;
        if (qedRegexRes) // Response ends in Qed.
          coqCode = qedRegexRes.tactics;

        return coqCode;
      }
    }
  }
}
