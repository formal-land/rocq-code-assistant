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
      label: 'prompt1 - Natural language description',
      files: 'out/test/oracles/natural-language-description/prompt1.test.js',
      args: [
        '"--disable-extensions"'
      ],
      mocha: {
        timeout: 0
      }
    },
    {
      label: 'prompt2 - Natural language description',
      files: 'out/test/oracles/natural-language-description/prompt2.test.js',
      args: [
        '"--disable-extensions"'
      ],
      mocha: {
        timeout: 0
      }
    },
    {
      label: 'prompt3 - Natural language description',
      files: 'out/test/oracles/natural-language-description/prompt3.test.js',
      args: [
        '"--disable-extensions"'
      ],
      mocha: {
        timeout: 0
      }
    },
    {
      label: 'prompt4 - Natural language description',
      files: 'out/test/oracles/natural-language-description/prompt4.test.js',
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
        timeout: 60000,
        ui: 'bdd'
      },
    }
  ]
);
