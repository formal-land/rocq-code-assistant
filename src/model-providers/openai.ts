import * as vscode from 'vscode';
import * as tiktoken from 'tiktoken';
import OpenAI from 'openai';
import { ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam, ChatCompletionContentPartText } from 'openai/resources/index.mjs';
import { ModelProviderMetadata } from './types';
import { ITokenizer } from '@vscode/prompt-tsx';
import { AnyTokenizer } from '@vscode/prompt-tsx/dist/base/tokenizer/tokenizer';

export function create(model: string, metadata: ModelProviderMetadata, apiKeyVarName: string): vscode.LanguageModelChat {
  const client = new OpenAI({ apiKey: process.env[apiKeyVarName] });
  
  async function sendRequest(messages: vscode.LanguageModelChatMessage[], options?: vscode.LanguageModelChatRequestOptions, token?: vscode.CancellationToken) {
    const stream = await client.chat.completions.create({
      model: model,
      messages: messages.map(vscodeToOpenAIMessage),
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

  return { 
    ...metadata, 
    sendRequest, 
    countTokens: (text: string | vscode.LanguageModelChatMessage, token?: vscode.CancellationToken) => countTokens(model, text, token)
  };
}

export function tokenizer(model: string): ITokenizer {
  return new AnyTokenizer(
    (text: string | vscode.LanguageModelChatMessage, token?: vscode.CancellationToken) => countTokens(model, text, token), 
    'vscode'
  );
}

async function countTokens(model: string, text: string | vscode.LanguageModelChatMessage, token?: vscode.CancellationToken) {
  const encoder = tiktoken.encoding_for_model(<tiktoken.TiktokenModel>model);
  
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

function vscodeToOpenAIRole(role: vscode.LanguageModelChatMessageRole) {
  switch (role) {
    case 1: return 'user';
    case 2: return 'assistant';
    default: return 'user';
  }
}

function vscodeToOpenAIContent(content: vscode.LanguageModelTextPart | vscode.LanguageModelToolResultPart | vscode.LanguageModelToolCallPart): ChatCompletionContentPartText {
  if (content instanceof vscode.LanguageModelTextPart)
    return { text: content.value, type: 'text'};
  else throw Error('Message type not supported');
}

function vscodeToOpenAIMessage(message: vscode.LanguageModelChatMessage): ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam {
  return {
    role: vscodeToOpenAIRole(message.role),
    content: message.content.map(vscodeToOpenAIContent), 
    name: message.name
  };
}