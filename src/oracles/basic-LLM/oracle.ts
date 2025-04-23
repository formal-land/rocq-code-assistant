import * as vscode from 'vscode';
import { Goal, PpString } from '../../lib/coq-lsp/types';
import * as utils from '../../utils';
import * as prompt1 from './prompt1';
import * as prompt2 from './prompt2';
import { Oracle } from '../oracle';
import { Token, Tokenizer } from '../../syntax/tokenizer';
import { Scope } from '../../syntax/scope';
import { Chat } from '../model';

export class BasicLLM extends Oracle {
  async query(goal: Goal<PpString>, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    const chat = this.model.chat(cancellationToken);
    await chat.continue(() => prompt1.render(goal, params));
    
    const rawResponseText = utils.languageModelChatMessagesToString([<vscode.LanguageModelChatMessage>chat.return().at(-1)]);
    const response = this.parseResponse(rawResponseText);
    const tactics = response ? await Tokenizer.get().tokenize(response, Scope.PROOF_BODY) : [];

    return {
      response: tactics,
      repair: (error: Oracle.Error) => {
        return this.repair(chat, tactics, error, params, cancellationToken);
      }
    };
  }
    
  async repair(chat: Chat, tactics: Token[], error: Oracle.Error, params?: Oracle.Params, cancellationToken?: vscode.CancellationToken) {
    chat.continue(() => prompt2.render(tactics, error));
        
    const rawResponseText = utils.languageModelChatMessagesToString([<vscode.LanguageModelChatMessage>chat.return().at(-1)]);
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
