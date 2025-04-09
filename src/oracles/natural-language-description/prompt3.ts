import { LanguageModelChatMessage } from 'vscode';
import { OracleParams } from '../types';
import { Name } from '../../syntax/scope';

export function render(history: LanguageModelChatMessage[], params?: OracleParams) {
  const messages: LanguageModelChatMessage[] = [];

  const rolePart = LanguageModelChatMessage.User('You are an expert in math and Coq theorem proving.');

  const introPart = LanguageModelChatMessage.User(`\
Translate the natural language description of the proof in Coq code.

**Instructions:**  
- Keep the translated code as simple and direct as possible.  
- Output only the sequence of valid Coq tactics required to solve the goal.  
- Do not include explanations, comments, imports, theorem definitions or any additional text.  
- Ensure no steps are omitted and the proof is complete in every part.  
- The output must be directly executable by Coq without any modifications and must correctly reference\
  all the variables and hypotheses names used in the Coq goal definition.
- Format the solution in a Markdown code block that starts with \`\`\`coq and ends with \`\`\`.`);

  const errorHistoryListPart = params?.errorHistory
    ?.map(({ tactics, at,  message }, idx) => `- Solution ${ idx + 1 }:
  + tactics: ${
  tactics.reduce((str, tactic, idx) =>
    str + 
      (idx === at ? `<<< ${tactic.value} >>>` : tactic.value) + 
      (tactic.scopes.includes(Name.FOCUSING_CONSTRUCT) ? ' ' : '\n\t'), '\n\t')
}
  + error: ${ message?.trim().replaceAll('\n', `\n${' '.repeat('- error: '.length)}`) }`)
    .join('\n');

  const errorHistoryPart = LanguageModelChatMessage.User(`\
These solutions have already been tried and they do not work. Please, avoid them. 
For each of them, the tactic where it failed is put between triple angle brackets \`<<< >>>\` and a\
description of the error is provided.
${errorHistoryListPart}`);

  messages.push(rolePart, ...history, introPart);
  if (errorHistoryListPart) messages.push(errorHistoryPart);

  return { messages: messages, history: messages.slice(5) };
}