import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { Prompt } from './prompt';

export async function pp(model: vscode.LanguageModelChat, text: string, cancellationToken?: vscode.CancellationToken) {
  const prompt = await renderPrompt(
    Prompt, { text }, { modelMaxPromptTokens: model.maxInputTokens }, model);

  const rawResponse = await model.sendRequest(prompt.messages, {}, cancellationToken);
  
  const fragments: string[] = [];
  for await (const fragment of rawResponse.text)
    fragments.push(fragment);

  const parsedResponse = fragments
    .join('')
    .match(/```coq(?<coqCode>[\s\S]*)```/);

  if (!parsedResponse?.groups) throw Error('Error quering the LLM');
  
  return parsedResponse.groups['coqCode'].trim();
}