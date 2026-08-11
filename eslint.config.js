export default [
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.js', 'test/**/*.js', 'example/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
];
