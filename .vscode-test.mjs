import { defineConfig } from '@vscode/test-cli';

export default defineConfig(
  [
    {
      label: 'extension',
      files: 'out/test/extension.test.js'
    },
    {
      label: 'prompt - BasicLLM',
      files: 'out/test/oracles/basicLLM/prompt.test.js',
      args: [
        '"--disable-extensions"'
      ],
      mocha: {
        timeout: 0
      }
    },
    {
      label: 'miniF2F',
      files: 'out/test/benchmarks/miniF2F/miniF2F.test.js',
      workspaceFolder: './src/test/benchmarks/miniF2F',
      mocha: {
        timeout: 0
      }
    }
  ]
);
