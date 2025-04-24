import { LanguageModelChatMessage } from 'vscode';

export function render(proof: string): LanguageModelChatMessage[] {
  return [LanguageModelChatMessage.User(
    `Pretty print the following Coq code. Put the code in a Markdown code block that begins \
with \`\`\`coq and ends with \`\`\`. Do not modify any instruction!
${proof}`
  )];
}