import * as vscode from 'vscode';

export class TestModelProvider implements vscode.LanguageModelChat {
  answers: string[];
  counter = 0;

  id = 'test-model';
  vendor = 'test-vendor';
  name = 'test-model';
  family = 'test-family';
  version = '1.0.0';
  maxInputTokens = Infinity;

  constructor(answers: string[]) {
    this.answers = answers;
  }

  async sendRequest(messages: vscode.LanguageModelChatMessage[], options?: vscode.LanguageModelChatRequestOptions, token?: vscode.CancellationToken) {
    const currentAnswer = this.answers.at(this.counter++);

    async function* responseTextGenerator() {
      yield currentAnswer ? currentAnswer : '';
    }
    
    async function* responseStreamGenerator() {
      yield new vscode.LanguageModelTextPart(currentAnswer ? currentAnswer : '');
    }

    return { stream: responseStreamGenerator(), text: responseTextGenerator() };
  }

  countTokens(text: string | vscode.LanguageModelChatMessage, token?: vscode.CancellationToken) {
    return Promise.resolve(0);
  }
}