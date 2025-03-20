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

    console.log(utils.languageModelChatMessagesToString(messages));

    const rawResponse = await this.model.sendRequest(
      messages, {}, cancellationToken);
    
    const fragments: string[] = [];
    for await (const fragment of rawResponse.text)
      fragments.push(fragment);

    const parsedResponse = fragments
      .join('')
      .match(/```coq(?<coqCode>[\s\S]*)```/);

    if (!parsedResponse?.groups) throw Error('Error quering the LLM');
    
    return parsedResponse.groups['coqCode'];
  }
}
