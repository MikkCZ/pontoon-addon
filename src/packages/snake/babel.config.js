'use strict';

module.exports = {
  presets: [
    '@babel/env',
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-transform-strict-mode',
  ],
};
