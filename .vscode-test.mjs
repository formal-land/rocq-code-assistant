import { defineConfig } from '@vscode/test-cli';

export default defineConfig(
  [{
    label: 'miniF2F',
    files: 'out/test/benchmarks/miniF2F/miniF2F.test.js',
    workspaceFolder: './src/test/benchmarks/miniF2F',
  }, {
    label: 'extension',
    files: 'out/test/extension.test.js'
  }]
);
