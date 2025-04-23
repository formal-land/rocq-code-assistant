import * as assert from 'assert';
import * as YAML from 'yaml';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Commands } from '../../../extension';
import * as utils from '../../../utils';
import * as extractors from '../../../syntax/extractors';
import { Proof } from '../../../proof/proof';
import { NaturalLanguageDescription } from '../../../oracles/natural-language-description/oracle';
import { shuffle } from '../../../utils';

interface Test {
  file: string,
  theorems: string[]
}

const DATASET_DESCRIPTION_PATH = './dataset/miniF2F.yaml';
const TEST_SIZE = 20; // Set to -1 to execute all the tests

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

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      console.log('');
      await vscode.commands.executeCommand(Commands.RESTART_COQ_LSP);
    }
  });

  let flatdatasetDescription = datasetDescription
    .flatMap(({ file, theorems }) => 
      theorems.map(theorem => ({ file: file, theorem: theorem })));
  
  if (TEST_SIZE >= 0)
    flatdatasetDescription = shuffle(flatdatasetDescription).slice(0, TEST_SIZE);

  flatdatasetDescription
    .forEach(({ file, theorem }) => 
      it(`Test ${file}: ${theorem}`, async function () {  
        if (!vscode.workspace.workspaceFolders) {
          assert.fail();
        } else {
          const fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/dataset', file);
          const fileDocument = await vscode.workspace.openTextDocument(fileUri);
          vscode.window.showTextDocument(fileDocument);
      
          let selectedModel, i = 0;
          while (!selectedModel && i++ < 10) {
            selectedModel = await vscode.commands.executeCommand(Commands.SELECT_MODEL, 'gpt-4o');
            await utils.delay(1000);
          }
          assert.notEqual(selectedModel, undefined);
      
          const textEditor = vscode.window.activeTextEditor;
          if (!textEditor) {
            vscode.window.showErrorMessage('No active text editor available.');
            throw new Error('No active text editor available.');
          }
          
          const proofTokens = await extractors.extractProofTokensFromName(theorem, textEditor.document.uri.fsPath); 
          
          if (!proofTokens) {
            vscode.window.showErrorMessage('Theorem not found.');
            throw new Error('Theorem not found.');
          }
          
          const proof = await Proof.fromTokens(fileUri.toString(), proofTokens);
          const success = await proof.autocomplete([new NaturalLanguageDescription(selectedModel as vscode.LanguageModelChat)]);

          assert.ok(success, 'Proof not found.');
        }
      }));
});