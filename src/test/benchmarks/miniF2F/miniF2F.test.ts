import * as assert from 'assert';
import * as YAML from 'yaml';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Commands } from '../../../extension';

interface Test {
  file: string,
  theorems: string[]
}

const DATASET_DESCRIPTION_PATH = './dataset/miniF2F.yaml';

describe('miniF2F benchmark', () => {
  before(async function () {
    const conf = vscode.workspace.getConfiguration('rocq-coding-assistant.provider.openai');
    await conf.update('enabled', 'true', vscode.ConfigurationTarget.Workspace);
    await conf.update('model.name', 'o1-mini', vscode.ConfigurationTarget.Workspace);
    await conf.update('model.context-window', 128000, vscode.ConfigurationTarget.Workspace);
    await conf.update('model.max-output-tokens', 65536, vscode.ConfigurationTarget.Workspace);
    await vscode.commands.executeCommand(Commands.SELECT_MODEL, 'rocq-coding-assistat:o1-mini');
  });
  
  let datasetDescription: Test[] = [];

  if (vscode.workspace.workspaceFolders) {
    const datasetDescriptionFileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, DATASET_DESCRIPTION_PATH);
    const datasetDescriptionFileContent = fs.readFileSync(datasetDescriptionFileUri.fsPath);
    datasetDescription = YAML.parse(datasetDescriptionFileContent.toString());
  }

  datasetDescription
    .flatMap(({ file, theorems }) =>
      theorems.map(theorem => ({ file: file, theorem: theorem })))
    .forEach(({ file, theorem }) => 
      it(`Test ${file}:${theorem}`, async function () {  
        if (!vscode.workspace.workspaceFolders) {
          assert.fail();
        } else {
          const fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/dataset', file);
          const fileDocument = await vscode.workspace.openTextDocument(fileUri);
          vscode.window.showTextDocument(fileDocument);
      
          const retSelectModel = await vscode.commands.executeCommand(Commands.SELECT_MODEL, 'gpt-4o-2024-11-20');
          assert.strictEqual(retSelectModel, 0);
      
          const retSolve = await vscode.commands.executeCommand(Commands.SOLVE, fileUri, theorem);
          assert.strictEqual(retSolve, 0);
        }
      }));
});