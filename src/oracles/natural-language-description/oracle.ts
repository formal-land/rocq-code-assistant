import * as vscode from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as utils from '../../utils';
import * as prompt1 from './prompt1';
import * as prompt2 from './prompt2';
import * as prompt3 from './prompt3';
import * as prompt4 from './prompt4';
import { Oracle } from '../oracle';
import { Chat } from '../model';

export class NaturalLanguageDescription extends Oracle {
  async query(goal: Goal<PpString>, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    const chat = this.model.chat(cancellationToken);
    await chat.continue(() => prompt1.render(goal));
    await chat.continue(() => prompt2.render());
    await chat.continue(() => prompt3.render(params));
    
    const rawResponseText = utils.languageModelChatMessagesToString([<vscode.LanguageModelChatMessage>chat.close().at(-1)]);
    const response = this.parseResponse(rawResponseText);
    
    return {
      response: response ? [response] : [],
      repair: (params: Oracle.Params) => {
        return this.repair(chat, params, cancellationToken);
      }
    };
  }

  async repair(chat: Chat, params: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    chat.continue(() => prompt4.render(params));
    
    const rawResponseText = utils.languageModelChatMessagesToString([<vscode.LanguageModelChatMessage>chat.close().at(-1)]);
    const response = this.parseResponse(rawResponseText);
    
    return {
      response: response ? [response] : [],
      repair: (params: Oracle.Params) => {
        return this.repair(chat, params, cancellationToken);
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