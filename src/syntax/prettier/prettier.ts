import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { Prompt } from './prompt';

export class Prettier {
  private model: vscode.LanguageModelChat;

  constructor(model: vscode.LanguageModelChat) {
    this.model = model;
  }

  async pp(text: string): Promise<string> {
    const prompt = await renderPrompt(
      Prompt, { text }, { modelMaxPromptTokens: this.model.maxInputTokens }, this.model);

    const rawResponse = await this.model.sendRequest(
      prompt.messages, {}, new vscode.CancellationTokenSource().token);
    
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