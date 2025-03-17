import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { Prompt } from './prompt';
import { Oracle, OracleParams } from '../types';

export class BasicLLM implements Oracle {
  private model: vscode.LanguageModelChat;

  constructor(model: vscode.LanguageModelChat) {
    this.model = model;
  }

  async query(goal: Goal<PpString>, params?: OracleParams, cancellationToken?: vscode.CancellationToken) {
    const prompt = await renderPrompt(
      Prompt, { goal, params }, { modelMaxPromptTokens: this.model.maxInputTokens }, this.model);

    const rawResponse = await this.model.sendRequest(
      prompt.messages, {}, cancellationToken);
    
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
