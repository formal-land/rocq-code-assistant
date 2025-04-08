import { LanguageModelChatMessage } from 'vscode';

export function render(history: LanguageModelChatMessage[]) {
  const messages: LanguageModelChatMessage[] = [];

  const rolePart = LanguageModelChatMessage.User('You are an expert in math and Coq theorem proving.');

  const introPart = LanguageModelChatMessage.User(`\
Translate the natural language description of the proof in Coq code.

**Instructions:**  
- Keep the translated code as simple and direct as possible.  
- Output only the sequence of valid Coq tactics required to solve the goal.  
- Do not include explanations, comments, imports, theorem definitions or any additional text.  
- Ensure no steps are omitted and the proof is complete in every part.  
- The output must be directly executable by Coq without any modifications and must correctly reference \
  all the variables and hypotheses names used in the Coq goal definition.
- Format the solution in a Markdown code block that starts with \`\`\`coq and ends with \`\`\`.`);

  messages.push(rolePart, ...history, introPart);

  return { messages: messages, history: messages.slice(5) };
}