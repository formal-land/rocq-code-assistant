import * as vscode from 'vscode';
import OpenAI from 'openai';
import * as tokenizer from 'tiktoken';
import { ChatCompletionAssistantMessageParam, ChatCompletionUserMessageParam, ChatCompletionContentPartText } from 'openai/resources/index.mjs';

export function init() {
  return new OpenAI();
}

export function registerLanguageModel(client: OpenAI, model: string, metadata: vscode.ChatResponseProviderMetadata) {
  async function provideLanguageModelResponse(messages: vscode.LanguageModelChatMessage[], options: vscode.LanguageModelChatRequestOptions, extensionId: string, progress: vscode.Progress<vscode.ChatResponseFragment2>, token: vscode.CancellationToken) {
    const stream = await client.chat.completions.create({
      model: model,
      messages: messages.map(_vscodeToOpenAIMessage),
      stream: true,
    });

    for await (const chunk of stream) {
      progress.report({ 
        index: 0, 
        part: new vscode.LanguageModelTextPart(chunk.choices[0]?.delta?.content || '') 
      });
    } 
  }
  
  const encoder = tokenizer.encoding_for_model(<tokenizer.TiktokenModel>model);

  async function provideTokenCount(text: string | vscode.LanguageModelChatMessage, token: vscode.CancellationToken): Promise<number> {
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

  let provider: vscode.LanguageModelChatProvider = {
    provideLanguageModelResponse,
    provideTokenCount
  };

  return vscode.lm.registerChatModelProvider(model, provider, metadata);
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