import { LanguageModelChatMessage } from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { OracleParams } from '../types';

export function render(goal: Goal<PpString>, params?: OracleParams) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`You are a Coq expert.
You will be provided with a description of a theorem and your task is to solve it.
Return a sequence of valid Coq tactics to solve the goal. Put the tactics in a Markdown 
code block that begins with \`\`\`coq and ends with \`\`\`.`);

  const hypotesisPart = goal.hyps
    .flatMap(block => 
      block.names.map(name => `* ${name} : ${block.ty}`))
    .join('\n');
    
  const goalPart = LanguageModelChatMessage.User(`The goal you have to prove is:

${goal.ty}

You can use the following hypotesis:
${hypotesisPart}`);

  const errorHistoryListPart = params?.errorHistory
    ?.map(({ tactics, message }, idx) => `* Solution ${ idx + 1 }:
\t- tactics: ${ tactics.map(tactic => tactic.value).join(' ') }
\t- error: ${ message?.trim().replaceAll('\n', `\n\t${' '.repeat('- error: '.length)}`) }`)
    .join('\n');

  const errorHistoryPart = LanguageModelChatMessage.User(`These solutions have already been \
tried and they do not work. Please, avoid them. For each of them, a description of the corresponding \
error is provided.
${errorHistoryListPart}`);

  messages.push(introPart);
  messages.push(goalPart);
  if (errorHistoryListPart) messages.push(errorHistoryPart);
  
  return messages;
}