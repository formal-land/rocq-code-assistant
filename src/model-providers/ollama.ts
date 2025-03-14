import * as vscode from 'vscode';
import { Ollama } from 'ollama';
import { ModelProviderMetadata } from './types';

export async function create(model: string, metadata: ModelProviderMetadata, host: string) {
  const client = new Ollama({ host });
  
  const ollamaProvidedModels = (await client.list()).models; 
  if (!ollamaProvidedModels.find(ollamaModel => ollamaModel.name === model))
    throw Error('Model not found');

  async function sendRequest(messages: vscode.LanguageModelChatMessage[], options?: vscode.LanguageModelChatRequestOptions, token?: vscode.CancellationToken) {
    const stream = await client.chat({
      model: model,
      messages: messages.map(_vscodeToOllamaMessage),
      stream: true
    });

    async function* responseTextGenerator() {
      for await (const chunk of stream)
        yield chunk.message.content;
    }
        
    async function* responseStreamGenerator() {
      for await (const chunk of stream)
        yield new vscode.LanguageModelTextPart(chunk.message.content);
    }
    
    return { stream: responseStreamGenerator(), text: responseTextGenerator() };
  } 

  async function countTokens(text: string | vscode.LanguageModelChatMessage, token: vscode.CancellationToken) {
    let fullText;
    
    if (typeof text === 'string')
      fullText = text;
    else
      fullText = text.content
        .map(part => {
          if (part instanceof vscode.LanguageModelTextPart) return part.value;
          else throw Error('Message type not supported'); })
        .join('');

    return fullText.length;
  }

  return { ...metadata, sendRequest, countTokens };
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