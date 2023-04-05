require('ts-node/register');

const path = require('path');

const { default: config } = require(path.resolve(__dirname, '.eslintrc.ts'));

module.exports = {
  ...config
};