import * as vscode from 'vscode';
import * as prompt from './prompt';

export async function pp(model: vscode.LanguageModelChat, proof: string, cancellationToken?: vscode.CancellationToken) {
  const messages = prompt.render(proof);

  const rawResponse = await model.sendRequest(messages, {}, cancellationToken);
  
  const fragments: string[] = [];
  for await (const fragment of rawResponse.text)
    fragments.push(fragment);

  const parsedResponse = fragments
    .join('')
    .match(/```coq(?<coqCode>[\s\S]*)```/);

  if (!parsedResponse?.groups) throw Error('Error quering the LLM');
  
  return parsedResponse.groups['coqCode'].trim();
}