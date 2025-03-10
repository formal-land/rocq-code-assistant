import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { Oracle } from '../types';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { Prompt } from './prompt';
import * as utils from '../../utils';

export function create(model: vscode.LanguageModelChat): Oracle {
  async function query(goal: Goal<PpString>) {
    const prompt = await renderPrompt(Prompt, { goal }, { modelMaxPromptTokens: model.maxInputTokens }, model );

    console.log(utils.languageModelChatMessagesToString(prompt.messages));

    const rawResponse = await model.sendRequest(prompt.messages, {}, new vscode.CancellationTokenSource().token);
    
    const fragments: string[] = [];
    for await (const fragment of rawResponse.text)
      fragments.push(fragment);

    const parsedResponse = fragments.join('').match(/```coq(?<coqCode>[\s\S]*)```/)?.groups;
    
    if (parsedResponse) return parsedResponse['coqCode'];
    else return Promise.reject('Error quering the LLM');
  }

  return { query };
}

