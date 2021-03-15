'use strict';

module.exports = {
  build: {
    overwriteDest: true,
  },
  ignoreFiles: [
    'packages/*/assets/',
    'packages/*/coverage/',
    'packages/*/public/',
    'packages/*/src/',
    '**/.eslintrc.js',
    '**/.eslintrc.yml',
    '**/babel.config.js',
    '**/jest.config.js',
    '**/jest.setup.js',
    '**/package.json',
    '**/webpack.config.js',
    '**/node_modules/',
  ],
};
