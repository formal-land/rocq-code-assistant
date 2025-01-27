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