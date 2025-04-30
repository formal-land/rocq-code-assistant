import * as vscode from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as utils from '../../utils';
import * as introPrompt from './prompts/intro';
import * as goalDescriptionPrompt from './prompts/goalDescription';
import * as translationPrompt from './prompts/translation';
import * as incorrectPrompt from './prompts/incorrect';
import { Token, Tokenizer } from '../../syntax/tokenizer';
import { Oracle } from '../oracle';
import { Chat } from '../model';
import { Scope } from '../../syntax/scope';

export class NaturalLanguageDescription extends Oracle {
  async query(goal: Goal<PpString>, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    const chat = this.model.chat(cancellationToken);
    await chat.continue(() => introPrompt.render(goal));
    await chat.continue(() => goalDescriptionPrompt.render());
    await chat.continue(() => translationPrompt.render(params));
    
    const rawResponseText = utils.languageModelChatMessageToString(<vscode.LanguageModelChatMessage>chat.return().at(-1));
    const response = this.parseResponse(rawResponseText);
    console.log(response);
    if (!response) throw new Error('No response from the Language Model');
    const tactics = response ? await Tokenizer.get().tokenize(response, Scope.PROOF_BODY) : [];

    return {
      response: tactics,
      repair: (error: Oracle.Error) => {
        return this.repair(chat, tactics, error, params, cancellationToken);
      }
    };
  }

  private async repair(chat: Chat, tactics: Token[], error: Oracle.Error, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    await chat.continue(() => incorrectPrompt.render(tactics, error));
    
    const rawResponseText = utils.languageModelChatMessageToString(<vscode.LanguageModelChatMessage>chat.return().at(-1));
    const response = this.parseResponse(rawResponseText);
    console.log(response);
    const newTactics = response ? await Tokenizer.get().tokenize(response, Scope.PROOF_BODY) : [];

    return {
      response: newTactics,
      repair: (newError: Oracle.Error) => {
        return this.repair(chat, newTactics, newError, params, cancellationToken);
      }
    };
  }
}