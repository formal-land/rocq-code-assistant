import * as vscode from 'vscode';

export function getConfNumber(name: string, def: number) {
  const value = vscode.workspace.getConfiguration('rocq-coding-assistant').get(name);
  if (typeof value === 'number') return value;
  else return def;
}

export function getConfBoolean(name: string, def: boolean) {
  const value = vscode.workspace.getConfiguration('rocq-coding-assistant').get(name);
  if (typeof value === 'boolean') return value;
  else return def;
}

export function getConfString(name: string, def: string) {
  const value = vscode.workspace.getConfiguration('rocq-coding-assistant').get(name);
  if (typeof value === 'string') return value;
  else return def;
}

export function zip<T, U>(first: Array<T>, second: Array<U>): Array<[T, U]> {
  const minLen = first.length < second.length ? first.length : second.length;

  const zipped = new Array<[T, U]>;
  for (let i = 0; i < minLen; i++)
    zipped.push([first[i], second[i]]);
  return zipped;
}

export function split<T>(array: T[], at: number[]) {
  const leftIdx = [0, ...at];
  const rightIdx = [...at, array.length];
  const pairSplitIdx = zip(leftIdx, rightIdx).filter(([start, end]) => start !== end);
  return pairSplitIdx.map(([start, end]) => array.slice(start, end));
}

export class Stack<T> {
  readonly items: T[] = [];
  
  push(...item: T[]) {
    this.items.push(...item);
    return item;
  }

  pop() {
    return this.items.pop(); 
  }

  peek() {
    if (this.size() > 0) return this.items[this.size() - 1];
  }

  size() {
    return this.items.length;
  }

  merge(stack: Stack<T>) {
    this.push(...stack.items);
  }
}

export function languageModelChatMessageToString(message: vscode.LanguageModelChatMessage) {
  return message.content
    .map(part => {
      if (part instanceof vscode.LanguageModelTextPart)
        return part.value;
      else 
        throw Error('Message type not supported');
    })
    .join('');
}

export function languageModelChatMessagesToString(messages: vscode.LanguageModelChatMessage[]) {
  return messages
    .flatMap(message =>
      message.content.map(part => {
        if (part instanceof vscode.LanguageModelTextPart)
          return part.value;
        else 
          throw Error('Message type not supported');
      }))
    .map((message, idx) => `=== Message ${idx} ===\n${message}`)
    .join('\n\n');
}

export function shuffle<T>(array: T[]) {
  const newArray = [...array];
  let currentIndex = newArray.length;

  while (currentIndex !== 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));