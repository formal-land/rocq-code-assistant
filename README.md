# rocq coding assistant

## 📊 Benchmarks
### MiniF2F
MiniF2F consists of mathematical exercises taken from olympiads (AMC, AIME, IMO), as well as high-school and undergraduate courses. The Rocq version of the dataset is [available](https://github.com/LLM4Rocq/miniF2F-rocq) as part of the LLM4Rocq project. 

#### Execute
To download, extract and adapt the dataset to the format required by the extension, in folder
```sh
src/test/benchmarks/miniF2F/
```
run 
```sh
./download.sh
``` 
Subsequently, the benchmark execution is provided as an internal. test within VS Code, labelled `miniF2F`.

## Tests
### Grammars
To test the grammar files for the Coq proofs run
```sh
npx vscode-tmgrammar-test -g ./resources/syntaxes/coq-proof.json -g ./resources/syntaxes/coq-proof-body.json <PATH TO TEST FILE>
```
basic test files are provided in `src/test/syntaxes/coq-proof`.