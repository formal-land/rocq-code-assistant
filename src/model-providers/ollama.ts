import * as vscode from 'vscode';
import { Ollama } from 'ollama';

export function init(host: string) {
  return new Ollama({ host });
}

export function registerLanguageModel(client: Ollama, model: string, metadata: vscode.ChatResponseProviderMetadata) {
  async function provideLanguageModelResponse(messages: vscode.LanguageModelChatMessage[], options: vscode.LanguageModelChatRequestOptions, extensionId: string, progress: vscode.Progress<vscode.ChatResponseFragment2>, token: vscode.CancellationToken) {
    const response = await client.chat({
      model: model,
      messages: messages.map(_vscodeToOllamaMessage),
      stream: true
    });

    for await (const part of response) {
      progress.report({ 
        index: 0, 
        part: new vscode.LanguageModelTextPart(part.message.content) 
      });
    }
  } 

  function provideTokenCount(text: string | vscode.LanguageModelChatMessage, token: vscode.CancellationToken): Thenable<number> {
    if (typeof text === 'string') {
      return Promise.resolve(text.length); // Simplified token count for string
    } else {
      const message = text as vscode.LanguageModelChatMessage;
      return Promise.resolve(message.content.length); // Simplified token count for LanguageModelChatMessage
    }
  }

  let provider = {
    provideLanguageModelResponse,
    provideTokenCount
  };

  return vscode.lm.registerChatModelProvider(model, provider, metadata);
}

function _vscodetoOllamaRole(role: vscode.LanguageModelChatMessageRole) {
  switch (role) {
    case 1: return 'user';
    case 2: return 'assistant';
    default: return 'user';
  }
}

function _vscodeToOllamaContent(content: vscode.LanguageModelTextPart | vscode.LanguageModelToolResultPart | vscode.LanguageModelToolCallPart) {
  if (content instanceof vscode.LanguageModelTextPart)
    return content.value;
  else throw Error('Message type not supported');
}

function _vscodeToOllamaMessage(message: vscode.LanguageModelChatMessage) {
  return {
    role: _vscodetoOllamaRole(message.role),
    content: message.content.map(_vscodeToOllamaContent).join('')
  };
}