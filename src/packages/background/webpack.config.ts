import path from 'path';
import type { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
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
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: 'ts-loader',
      },
      {
        test: /\.json$/,
        exclude: /(node_modules)/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|svg)$/,
        loader: 'file-loader',
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
    extensions: [ '.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.png', '.svg', '.md' ],
    alias: {
      '@assets': path.resolve('./assets/'),
      '@pontoon-addon/commons': path.resolve('../commons/'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns:[
        { from: 'assets/data', to: 'data' },
      ],
    }),
  ],
};

export default config;
