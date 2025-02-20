import * as vscode from 'vscode';
import * as tokenizer from 'tiktoken';
import OpenAI from 'openai';
import { ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam, ChatCompletionContentPartText } from 'openai/resources/index.mjs';
import { ModelProviderMetadata } from './types';

export function create(model: string, metadata: ModelProviderMetadata, apiKeyVarName: string): vscode.LanguageModelChat {
  const client = new OpenAI({ apiKey: process.env[apiKeyVarName] });
  
  async function sendRequest(messages: vscode.LanguageModelChatMessage[], options?: vscode.LanguageModelChatRequestOptions, token?: vscode.CancellationToken) {
    const stream = await client.chat.completions.create({
      model: model,
      messages: messages.map(_vscodeToOpenAIMessage),
      stream: true,
    });

    async function* responseTextGenerator() {
      for await (const chunk of stream)
        yield chunk.choices[0]?.delta?.content || '';
    }
    
    async function* responseStreamGenerator() {
      for await (const chunk of stream)
        yield new vscode.LanguageModelTextPart(chunk.choices[0]?.delta?.content || '');
    }

    return { stream: responseStreamGenerator(), text: responseTextGenerator() };
  }
  
  const encoder = tokenizer.encoding_for_model(<tokenizer.TiktokenModel>model);

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

    return encoder.encode(fullText).length;
  }

  return { ...metadata, sendRequest, countTokens };
}

function _vscodeToOpenAIRole(role: vscode.LanguageModelChatMessageRole) {
  switch (role) {
    case 1: return 'user';
    case 2: return 'assistant';
    default: return 'user';
  }
}

function _vscodeToOpenAIContent(content: vscode.LanguageModelTextPart | vscode.LanguageModelToolResultPart | vscode.LanguageModelToolCallPart): ChatCompletionContentPartText {
  if (content instanceof vscode.LanguageModelTextPart)
    return { text: content.value, type: 'text'};
  else throw Error('Message type not supported');
}

function _vscodeToOpenAIMessage(message: vscode.LanguageModelChatMessage): ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam {
  return {
    role: _vscodeToOpenAIRole(message.role),
    content: message.content.map(_vscodeToOpenAIContent), 
    name: message.name
  };
}