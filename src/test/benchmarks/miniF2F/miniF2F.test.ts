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

suite('miniF2F benchmark', () => {
  suiteSetup(async () => {
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
    .slice(0, 1)
    .forEach(({ file, theorem }) => 
      test(`Test ${file}:${theorem}`, () => _testTheorem(file, theorem)));
});

async function _testTheorem(file: string, proofName: string) {
  if (!vscode.workspace.workspaceFolders) {
    assert.fail();
  } else {
    const fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/dataset', file);
    const fileDocument = await vscode.workspace.openTextDocument(fileUri);
    vscode.window.showTextDocument(fileDocument);

    const ret = await vscode.commands.executeCommand(Commands.HELLO_WORLD);

    assert.strictEqual(ret, 0);
  }
}