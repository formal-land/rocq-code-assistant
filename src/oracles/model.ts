import * as vscode from 'vscode';
import * as utils from '../utils';

export class Chat {
  private model: Model;
  private history: vscode.LanguageModelChatMessage[] = [];
  private cancellationToken?: vscode.CancellationToken;

  constructor(model: Model, history: vscode.LanguageModelChatMessage[] = [], cancellationToken?: vscode.CancellationToken) {
    this.history = history;
    this.model = model;
    this.cancellationToken = cancellationToken;
  }

  async continue(continuation: (response: string, history: vscode.LanguageModelChatMessage[]) => vscode.LanguageModelChatMessage[]) {
    let lastMessage = this.history.at(-1);
    if (!lastMessage) lastMessage = vscode.LanguageModelChatMessage.User('');
    const lastResponse = utils.languageModelChatMessageToString(lastMessage);

    const newMessages = continuation(lastResponse, this.history); 
    const response = await this.model.sendRequest([...this.history, ...newMessages], this.cancellationToken);
    this.history.push(...newMessages, response);
  }

  return() {
    return this.history;
  }
}

export class Model {
  private model: vscode.LanguageModelChat;

  constructor(model: vscode.LanguageModelChat) {
    this.model = model;
  }

  async sendRequest(messages: vscode.LanguageModelChatMessage[], cancellationToken?: vscode.CancellationToken) {
    const rawResponse = await this.model.sendRequest(messages, {}, cancellationToken);
    const fragments = [];
    for await (const fragment of rawResponse.text)
      fragments.push(fragment);
    const response = fragments.join('');
  
    return vscode.LanguageModelChatMessage.Assistant(response);
  }

  chat(cancellationToken?: vscode.CancellationToken) {
    return new Chat(this, [], cancellationToken);
  }
}