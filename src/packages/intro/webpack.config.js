'use strict';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
        },
        {
          test: /\.(png|svg)$/,
          loader: 'file-loader',
        },
      ],
    },
    resolve: {
      extensions: [ '.js', '.json', '.jsx', '.css' ],
      alias: {
        '@assets': path.resolve(__dirname, './assets/'),
        '@pontoon-addon/commons': path.resolve(__dirname, '../commons/'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({ template: htmlTemplate }),
      new MiniCssExtractPlugin({}),
    ],
  };
};
