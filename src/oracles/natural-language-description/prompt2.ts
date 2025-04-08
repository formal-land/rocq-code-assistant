import { LanguageModelChatMessage } from 'vscode';

export function render(history: LanguageModelChatMessage[]) {
  const messages: LanguageModelChatMessage[] = [];

  const rolePart = LanguageModelChatMessage.User('You are an expert in math and Coq theorem proving.');

  const introPart = LanguageModelChatMessage.User(`\
Provide a complete description of the proof in natural language.

**Instructions:** 
- The description must be very precise, complete and include any non trivial step of the proof
- It must be presented across multiple successive points
- Produce the proof description only, without any introduction.`);

  messages.push(rolePart, ...history, introPart);

  return { messages: messages, history: messages.slice(3) };
}