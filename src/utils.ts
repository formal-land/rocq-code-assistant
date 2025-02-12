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

export class Stack<T> {
  private items: T[] = [];

  content() {
    return this.items;
  }
  
  push(item: T) {
    this.items.push(item);
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
}