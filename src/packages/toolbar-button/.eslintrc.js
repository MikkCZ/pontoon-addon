'use strict';

module.exports = {
  rules: {
    'no-var': ['error'],
    'space-before-blocks': ['error', 'always'],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'spaced-comment': ['warn'],
    'no-console': ['error', { 'allow': ['error'] }],
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:testing-library/dom',
    'plugin:testing-library/react',
    'plugin:prettier/recommended', // must be the last one
  ],
  env: {
    webextensions: true,
    browser: true,
    jest: true,
    es2020: true,
  },
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
    'import/resolver': 'webpack',
  },
};
