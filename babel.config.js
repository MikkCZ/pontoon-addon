'use strict';

module.exports = {
  presets: [
    '@babel/env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-strict-mode',
  ],
};
