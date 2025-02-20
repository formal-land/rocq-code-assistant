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

async function _testTheorem(file: string, proofName: string) {
  if (!vscode.workspace.workspaceFolders) {
    assert.fail();
  } else {
    const fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, file);
    const fileDocument = await vscode.workspace.openTextDocument(fileUri);
    vscode.window.showTextDocument(fileDocument);
    const ret = await vscode.commands.executeCommand(Commands.HELLO_WORLD, proofName);
    assert.strictEqual(ret, 0);
  }
}

suite('miniF2F benchmark', () => {
  let dsDescription: Test[] = [];

  if (vscode.workspace.workspaceFolders) {
    const dsDescriptionFileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, DATASET_DESCRIPTION_PATH);
    const dsDescriptionFileContent = fs.readFileSync(dsDescriptionFileUri.fsPath);
    dsDescription = YAML.parse(dsDescriptionFileContent.toString());
  }

  dsDescription
    .flatMap(({ file, theorems }) =>
      theorems.map(theorem => ({ file: file, theorem: theorem })))
    .forEach(({ file, theorem }) => 
      test(`Test ${file}:${theorem}`, () => _testTheorem(file, theorem)));
});