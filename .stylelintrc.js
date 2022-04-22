'use strict';

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
      files: ['./src/**/*.{js,jsx,ts,tsx}'],
      customSyntax: '@stylelint/postcss-css-in-js',
    }
  ],
};
