import { defineConfig } from '@vscode/test-cli';

export default defineConfig(
  [{
    label: 'miniF2F benchmark',
    files: 'out/test/benchmarks/miniF2F/miniF2F.test.js',
    launchArgs: ['--enable-proposed-api=formal-land.rocq-coding-assistant'],
    workspaceFolder: './src/test/benchmarks/miniF2F/dataset',
  }, {
    label: 'extension',
    files: 'out/test/extension.test.js',
    launchArgs: ['--enable-proposed-api=formal-land.rocq-coding-assistant']
  }]
);
