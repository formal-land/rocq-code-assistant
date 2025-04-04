import * as assert from 'assert';
import * as YAML from 'yaml';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as Prettier from '../../../syntax/prettier/prettier';
import { Commands } from '../../../extension';
import { Tokenizer } from '../../../syntax/tokenizer';
import { Scope } from '../../../syntax/scope';
import * as extractors from '../../../syntax/extractors';
import { Proof } from '../../../proof';
import { BasicLLM } from '../../../oracles/basic-LLM/oracle';

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

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      console.log('');
      await vscode.commands.executeCommand(Commands.RESTART_COQ_LSP);
    }
  });

  datasetDescription
    .flatMap(({ file, theorems }) =>
      theorems.map(theorem => ({ file: file, theorem: theorem })))
    .forEach(({ file, theorem }) => 
      it(`Test ${file}: ${theorem}`, async function () {  
        if (!vscode.workspace.workspaceFolders) {
          assert.fail();
        } else {
          const fileUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/dataset', file);
          const fileDocument = await vscode.workspace.openTextDocument(fileUri);
          vscode.window.showTextDocument(fileDocument);
      
          const selectedModel = await vscode.commands.executeCommand(Commands.SELECT_MODEL, 'gpt-4o-2024-11-20');
          assert.notEqual(selectedModel, undefined);
      
          const textEditor = vscode.window.activeTextEditor;
          if (!textEditor) {
            vscode.window.showErrorMessage('No active text editor available.');
            throw new Error('No active text editor available.');
          }
          
          const tokenizedText = await Tokenizer.get().tokenize(textEditor.document.getText(), Scope.PROOF);
          const proofTokens = extractors.extractProofTokensFromName(theorem, tokenizedText);
          
          if (!proofTokens) {
            vscode.window.showErrorMessage('Theorem not found.');
            throw new Error('Theorem not found.');
          }
          
          const proof = await Proof.fromTokens(fileUri.toString(), proofTokens);
          const success = await proof.autocomplete([new BasicLLM(selectedModel as vscode.LanguageModelChat)]);
          // const ppProof = await Prettier.pp(selectedModel as vscode.LanguageModelChat, proof.toString());

          // console.log(ppProof);

          assert.ok(success, 'Proof not found.');
        }
      }));
});