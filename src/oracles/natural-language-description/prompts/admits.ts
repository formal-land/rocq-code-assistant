import { LanguageModelChatMessage } from 'vscode';

export function render(): LanguageModelChatMessage[] {
  return [LanguageModelChatMessage.User('\
This solution contains one or more admits. Replace each admit with valid Coq code to complete the \
proof.')];
}