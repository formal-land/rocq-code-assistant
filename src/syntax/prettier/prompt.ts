import { LanguageModelChatMessage } from 'vscode';

export function render(proof: string): LanguageModelChatMessage[] {
  return [LanguageModelChatMessage.User(`\
Pretty print the following Coq code. 

**Instructions:**
- Do not modify any instruction.
- Use a simple and straightforward style.
- Put the code in a Markdown code block that begins with \`\`\`coq and ends with \`\`\`. `),
  LanguageModelChatMessage.User(proof)];
}