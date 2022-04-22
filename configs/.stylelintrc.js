'use strict';

const path = require('path');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  processors: [
    "stylelint-processor-styled-components"
  ],
  extends: [
    "stylelint-config-recommended",
    "stylelint-config-styled-components",
  ],
  overrides: [
    {
      files: [`${rootDir}/src/**/*.tsx`],
      customSyntax: '@stylelint/postcss-css-in-js',
    }
  ],
};
