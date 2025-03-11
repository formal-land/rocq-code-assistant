# rocq coding assistant

## 📊 Test
### Grammars
To test the grammar files for the Coq proofs run
```sh
npx vscode-tmgrammar-test -g ./resources/syntaxes/coq-proof.json -g ./resources/syntaxes/coq-proof-body.json <PATH TO TEST FILE>
```
basic test files are provided in `src/test/syntaxes/coq-proof`.