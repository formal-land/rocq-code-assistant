import { LanguageModelChatMessage } from 'vscode';
import { Oracle } from '../oracle';

export function render(params?: Oracle.Params) {
  const messages: LanguageModelChatMessage[] = [];

  const introPart = LanguageModelChatMessage.User('\
The previous solution you provided do not work. Provide antoher one or try to repair it.');

  const error = params?.errorHistory?.at(-1);

  const errorPart = LanguageModelChatMessage.User(`\
The error is as follows:
At ${error?.tactics?.at(error.at)?.value},
${error?.message}`);

  messages.push(introPart);
  if (error) messages.push(errorPart);

  return messages;
}