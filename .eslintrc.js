'use strict';

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:testing-library/dom',
    'plugin:testing-library/react',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended', // must be the last one
  ],
  rules: {
    'import/order': [
      'error',
      {
        groups: [ 'builtin', 'external', 'internal', 'parent', 'sibling', 'index' ],
        'newlines-between': 'always',
      },
    ],
    'import/newline-after-import': [
      'error',
      {
        count: 1,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
      },
    ],
    'react/prop-types': 'off',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': [ '.ts', '.tsx' ],
    },
    'import/resolver': 'webpack',
  },
  env: {
    webextensions: true,
    browser: true,
    jest: true,
    es2020: true,
  },
};
