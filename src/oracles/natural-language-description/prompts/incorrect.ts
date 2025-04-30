import { LanguageModelChatMessage } from 'vscode';
import { Token } from '../../../syntax/tokenizer';
import { Oracle } from '../../oracle';

export function render(tactics: Token[], error: Oracle.Error) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`\
This solution do not work. You can either:
- Repair the solution on the basis of the error message.
- Provide a completely new solution.
But not repeat the same solution.

**Instructions:**  
- Keep the code as simple and direct as possible.  
- Output only the sequence of valid Coq tactics required to solve the goal.  
- Do not include explanations, comments, imports, theorem definitions or any additional text.  
- Ensure no steps are omitted and the proof is complete in every part.
- Do not omit any step.
- Do not use admit.
- Do not use comments.
- The output must be directly executable by Coq without any modifications and must correctly reference \
  all the variables and hypotheses names used in the Coq goal definition.
- Format the solution in a Markdown code block that starts with \`\`\`coq and ends with \`\`\`.`);

  const errorPart = LanguageModelChatMessage.User(`\
This is a complete description of the error:
- At: ${ tactics.at(error.at)?.value }
- Message: ${ error?.message }`);

  messages.push(introPart);
  if (error) messages.push(errorPart);

  return messages;
}