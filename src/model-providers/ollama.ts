import * as vscode from 'vscode';
import * as ollama from 'ollama';

export function init(host: string) {
  return new ollama.Ollama({ host: host });
}

export function registerLanguageModel(client: ollama.Ollama, model: ollama.ModelResponse, maxInputTokens: number, maxOutputTokens: number) {
  
  async function provideLanguageModelResponse(messages: vscode.LanguageModelChatMessage[], options: vscode.LanguageModelChatRequestOptions, extensionId: string, progress: vscode.Progress<vscode.ChatResponseFragment2>, token: vscode.CancellationToken) {
    try {
      const response = await client.chat({
        model: model.name,
        messages: messages.map(vscodeToOllamaMessage),
        stream: true
      });

      for await (const part of response)
        progress.report({ index: 0, part: new vscode.LanguageModelTextPart(part.message.content) });  

    } catch (error) {
      if (error instanceof Error) {
        if (error.cause !== undefined && error.cause instanceof Object &&
            'message' in error.cause && typeof error.cause.message === 'string' &&
            'code' in error.cause && typeof error.cause.code === 'string')
          switch (error.cause.code) {
            case 'ECONNREFUSED':
              throw vscode.LanguageModelError.NotFound(error.cause.message); // TODO: better error type?
            // ...other error codes of the same type to be added here...
            default:
              throw new vscode.LanguageModelError(error.cause.message);
          }
        else if ('status_code' in error && typeof error.status_code === 'number' &&
                  'message' in error && typeof error.message === 'string')
          switch (error.status_code) {
            case 404:
              throw vscode.LanguageModelError.NotFound(error.message);
            // ...other error codes of the same type to be added here...
            default:
              throw new vscode.LanguageModelError(error.message);
          }
      } else {
        throw new vscode.LanguageModelError(); // generic error
      }
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

  let provider: vscode.LanguageModelChatProvider = {
    provideLanguageModelResponse,
    provideTokenCount
  };

  let metadata = {
    name: model.name,
    version: '',
    family: model.details.family,
    vendor: 'ollama',
    maxInputTokens,
    maxOutputTokens
  };

  return vscode.lm.registerChatModelProvider(model.name, provider, metadata);
}

function mapRole(role: vscode.LanguageModelChatMessageRole) {
  switch (role) {
    case 1: return 'user';
    case 2: return 'assistant';
    // ... other roles to be added here ...
    default: return 'user';
  }
}

function vscodeToOllamaMessage(message: vscode.LanguageModelChatMessage): ollama.Message {
  return {
    role: mapRole(message.role),
    content: message.content
      .map(part => (part instanceof vscode.LanguageModelTextPart) ? part.value : '') // No other part supported at the moment
      .join('\n')
  };
}