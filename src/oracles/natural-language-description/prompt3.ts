import { LanguageModelChatMessage } from 'vscode';
import { Oracle } from '../oracle';

export function render(params?: Oracle.Params) {
  const messages: LanguageModelChatMessage[] = [];

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

  const hintsListPart = params?.comment?.hints
    ?.map(hint => `- ${ hint.trim() }`);
  
  const hintsPart = LanguageModelChatMessage.User(`\
These hints may help you to solve the goal. Please, use them if you find them useful.
${hintsListPart?.length ? hintsListPart.join('\n') : ''}`);

  const examplesListPart = params?.comment?.examples
    ?.map(example => `- ${ example }`)
    .join('\n\n');

  const examplesPart = LanguageModelChatMessage.User(`\
These examples may help you to solve the goal. Please, use them if you find them useful.
${examplesListPart}`);

  messages.push(introPart);
  if (hintsListPart) messages.push(hintsPart);
  if (examplesListPart) messages.push(examplesPart);

  return messages;
}