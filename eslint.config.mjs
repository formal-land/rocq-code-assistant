import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [{
  files: ['**/*.ts'],
  ignores: ['src/lib/**']
}, {
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },

  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2023,
    sourceType: 'module',
  },

  rules: {
    '@typescript-eslint/naming-convention': ['warn', {
      selector: ['import', 'variableLike'],
      format: ['camelCase', 'PascalCase']
    }],

    curly: ['warn', 'multi', 'consistent'],
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: 'warn',
    indent: ['warn', 2, { 'SwitchCase': 1 }],
    quotes: ['warn', 'single'],
    'keyword-spacing': 'warn'
  },
}];