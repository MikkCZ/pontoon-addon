'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const jsEntry = './src/index.jsx';
const htmlTemplate = './public/index.html';

module.exports = () => {
  return {
    mode: 'production',
    devtool: 'cheap-source-map',
    performance: {
      hints: false,
    },
    stats: 'errors-only',
    entry: jsEntry,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
        },
      ],
    },
    resolve: {
      extensions: [ '.js', '.json', '.jsx', '.css' ],
      alias: {
        '@pontoon-addon/commons': path.resolve(__dirname, '../commons/'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({ template: htmlTemplate }),
    ],
  };
};
