import * as vscode from 'vscode';

export function getConfigurationNumber(name: string, def: number) {
  const value = vscode.workspace.getConfiguration('rocq-coding-assistant').get(name);
  if (typeof value === 'number') return value;
  else return def;
}

export function getConfigurationBoolean(name: string, def: boolean) {
  const value = vscode.workspace.getConfiguration('rocq-coding-assistant').get(name);
  if (typeof value === 'boolean') return value;
  else return def;
}

export function getConfigurationString(name: string, def: string) {
  const value = vscode.workspace.getConfiguration('rocq-coding-assistant').get(name);
  if (typeof value === 'string') return value;
  else return def;
}