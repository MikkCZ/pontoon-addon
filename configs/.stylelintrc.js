'use strict';

const path = require('path');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  processors: [
    'stylelint-processor-styled-components',
  ],
  plugins: [
    'stylelint-no-unsupported-browser-features',
  ],
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-styled-components',
  ],
  rules: {
    'plugin/no-unsupported-browser-features': [
      true,
      {
        severity: 'warning',
      },
    ],
  },
  overrides: [
    {
      files: [`${rootDir}/src/**/*.tsx`],
      customSyntax: '@stylelint/postcss-css-in-js',
    },
  ],
};
