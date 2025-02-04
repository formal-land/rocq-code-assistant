import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { Oracle } from '../oracle';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { Prompt } from './prompt';

export function create(model: vscode.LanguageModelChat): Oracle {

  async function query(goal: Goal<PpString>): Promise<string> {
    const { messages } = await renderPrompt(
      Prompt,
      { goal },
      { modelMaxPromptTokens: 4096 },
      model
    );

    const response = await model.sendRequest(
      messages,
      {},
      new vscode.CancellationTokenSource().token
    );

    const responseText: string[] = [];
    for await (const fragment of response.text)
      responseText.push(fragment);

    return responseText.join('');
  }

  return { query };
}

