import { LanguageModelChatMessage } from 'vscode';

export function render() {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User(`\
Provide a complete description of the steps needed to prove the goal in natural language, in a style\
that is suitable to be later translated into Coq code.

**Instructions:** 
- The description must be very precise, complete and include any non trivial step of the proof
- It must be presented across multiple successive points
- Produce the proof description only, without any introduction.`);

  messages.push(introPart);

  return messages;
}