import * as vscode from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as utils from '../../utils';
import * as prompt1 from './prompt1';
import * as prompt2 from './prompt2';
import * as prompt3 from './prompt3';
import * as prompt4 from './prompt4';
import { Token, Tokenizer } from '../../syntax/tokenizer';
import { Oracle } from '../oracle';
import { Chat } from '../model';
import { Scope } from '../../syntax/scope';

export class NaturalLanguageDescription extends Oracle {
  async query(goal: Goal<PpString>, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    const chat = this.model.chat(cancellationToken);
    await chat.continue(() => prompt1.render(goal));
    await chat.continue(() => prompt2.render());
    await chat.continue(() => prompt3.render(params));
    
    const rawResponseText = utils.languageModelChatMessageToString(<vscode.LanguageModelChatMessage>chat.return().at(-1));
    const response = this.parseResponse(rawResponseText);
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
    chat.continue(() => prompt4.render(tactics, error));
    
    const rawResponseText = utils.languageModelChatMessageToString(<vscode.LanguageModelChatMessage>chat.return().at(-1));
    const response = this.parseResponse(rawResponseText);
    const newTactics = response ? await Tokenizer.get().tokenize(response, Scope.PROOF_BODY) : [];

    return {
      response: newTactics,
      repair: (newError: Oracle.Error) => {
        return this.repair(chat, newTactics, newError, params, cancellationToken);
      }
    };
  }
}