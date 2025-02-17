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

    const rawResponse = await model.sendRequest(
      messages,
      {},
      new vscode.CancellationTokenSource().token
    );

    const fragments: string[] = [];
    for await (const fragment of rawResponse.text)
      fragments.push(fragment);

    const parsedResponse = fragments.join('').match(/```coq(?<coqCode>[\s\S]*)```/)?.groups;
    
    if (parsedResponse) return parsedResponse['coqCode'];
    else return Promise.reject('Error quering the LLM');
  }

  return { query };
}

