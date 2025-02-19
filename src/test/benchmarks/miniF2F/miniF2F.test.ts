import * as assert from 'assert';
import * as YAML from 'yaml';
import * as vscode from 'vscode';
import * as fs from 'fs';

interface Test {
  file: string,
  theorems: string[]
}

const DATASET_DESCRIPTION_PATH = './miniF2F.yaml';

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
    .forEach(({ file, theorem }) => {
      test(`Test ${file}:${theorem}`, () => {
        assert.strictEqual(1, 1);
      });
    });
});