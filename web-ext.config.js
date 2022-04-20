'use strict';

module.exports = {
  build: {
    overwriteDest: true,
  },
  ignoreFiles: [
    'packages/*/assets/',
    'packages/*/coverage/',
    'packages/*/src/',
    '**/node_modules/',
    '**/.eslintrc.js',
    '**/babel.config.js',
    '**/jest.config.ts',
    '**/jest.setup.ts',
    '**/package.json',
    '**/tsconfig.json',
    '**/webpack.config.ts',
  ],
};
