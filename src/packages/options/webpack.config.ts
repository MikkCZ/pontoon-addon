import path from 'path';
import type { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

enum WebpackModes {
  PROD = 'production',
  DEVEL = 'development',
}

const mode = process.env.MODE === WebpackModes.DEVEL ? WebpackModes.DEVEL : WebpackModes.PROD;
const devtool = mode === WebpackModes.DEVEL ? 'source-map' : undefined;
const entry = path.resolve('./src/index.ts');

const config: Configuration = {
  mode,
  devtool,
  performance: {
    hints: false,
  },
  stats: 'errors-only',
  entry,
  output: {
    path: path.resolve('./dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [ MiniCssExtractPlugin.loader, 'css-loader' ],
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    modules: [ 'node_modules' ],
    extensions: [ '.js', '.ts', '.json', '.css' ],
    alias: {
      '@pontoon-addon/commons': path.resolve('../commons/'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('./src/index.ejs'),
      title: 'Pontoon Add-on Settings',
      favicon: path.resolve('../commons/static/img/pontoon-logo.svg'),
      meta: {
        viewport: 'width=device-width,initial-scale=1',
      },
    }),
    new MiniCssExtractPlugin({}),
  ],
};

export default config;
