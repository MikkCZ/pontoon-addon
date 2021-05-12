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
const entry = path.resolve('./src/index.tsx');

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
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: 'ts-loader',
      },
      {
        test: /\.md$/,
        exclude: /(node_modules)/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    modules: [ 'node_modules' ],
    extensions: [ '.js', '.ts', '.json', '.jsx', '.tsx', '.css', '.md' ],
    alias: {
      '@assets': path.resolve('./assets/'),
      '@pontoon-addon/commons': path.resolve('../commons/'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('./src/index.ejs'),
      title: 'Pontoon Add-on - Privacy Policy',
      favicon: path.resolve('../commons/static/img/pontoon-logo.svg'),
      meta: {
        viewport: 'width=device-width,initial-scale=1',
      },
      rootId: 'privacy-policy-root',
    }),
    new MiniCssExtractPlugin({}),
  ],
};

export default config;
