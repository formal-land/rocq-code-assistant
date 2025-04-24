import { LanguageModelChatMessage } from 'vscode';
import { Token } from '../../syntax/tokenizer';
import { Oracle } from '../oracle';

export function render(tactics: Token[], error: Oracle.Error) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User('\
The previous solution you provided do not work. Provide antoher one or try to repair it.');

  const errorPart = LanguageModelChatMessage.User(`\
This is a complete description of the error:
- At: ${ tactics.at(error.at)?.value }
- Message: ${ error?.message }`);

  messages.push(introPart);
  if (error) messages.push(errorPart);

  return messages;
}