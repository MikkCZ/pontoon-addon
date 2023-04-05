import type { Config } from 'stylelint';

const config: Config = {
  extends: [
    'stylelint-config-standard',
  ],
  customSyntax: 'postcss-styled-syntax',
  plugins: [
    'stylelint-no-unsupported-browser-features',
  ],
  rules: {
    'plugin/no-unsupported-browser-features': [
      true,
      {
        severity: 'warning',
      },
    ],
  },
};

export default config;