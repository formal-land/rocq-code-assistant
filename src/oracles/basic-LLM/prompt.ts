import { LanguageModelChatMessage } from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import { Oracle } from '../oracle';
import { Name } from '../../syntax/scope';

export function render(goal: Goal<PpString>, params?: Oracle.Params) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`\
You are an expert in Coq theorem proving.  
You will be given a goal statement, and your task is to provide a complete proof using only Coq tactics.  

**Instructions:**  
- Keep the proof as simple and direct as possible.  
- Output only the sequence of valid Coq tactics required to solve the goal.  
- Do not include explanations, comments, imports, theorem definitions or any additional text.  
- Ensure no steps are omitted.  
- The output must be directly executable by Coq without any modifications.
- Format the solution in a Markdown code block that starts with \`\`\`coq and ends with \`\`\`.`);

  const hypotesisPart = goal.hyps
    .flatMap(block => 
      block.names.map(name => `* ${name} : ${block.ty}`))
    .join('\n');
    
  const goalPart = LanguageModelChatMessage.User(`\
The goal you have to prove is:

${goal.ty} ${hypotesisPart.length > 0 ? `

You can use the following hypotesis: 
${hypotesisPart}` : ''}`);

  const errorHistoryListPart = params?.errorHistory
    ?.map(({ tactics, at,  message }, idx) => `* Solution ${ idx + 1 }:
\t- tactics: ${
  tactics.reduce((str, tactic, idx) =>
    str + 
    (idx === at ? `<<< ${tactic.value} >>>` : tactic.value) + 
    (tactic.scopes.includes(Name.FOCUSING_CONSTRUCT) ? ' ' : '\n\t\t'), '\n\t\t')
}
\t- error: ${ message?.trim().replaceAll('\n', `\n\t${' '.repeat('- error: '.length)}`) }`)
    .join('\n');

  const errorHistoryPart = LanguageModelChatMessage.User(`\
These solutions have already been tried and they do not work. Please, avoid them. 
For each of them, the tactic where it failed is put between triple angle brackets \`<<< >>>\` and a \ 
description of the error is provided.
${errorHistoryListPart}`);

  messages.push(introPart);
  messages.push(goalPart);
  if (errorHistoryListPart) messages.push(errorHistoryPart);
  
  return messages;
}