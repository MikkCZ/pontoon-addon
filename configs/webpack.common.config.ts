import path from 'path';
import type { Configuration, RuleSetUseItem } from 'webpack';
import { ProvidePlugin } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { BrowserFamily } from '../src/manifest.json';

const rootDir = path.resolve(__dirname, '..');
export const srcDir = path.resolve(rootDir, 'src');

enum WebpackMode {
  PROD = 'production',
  DEVEL = 'development',
}

const mode = process.env.MODE === WebpackMode.DEVEL ? WebpackMode.DEVEL : WebpackMode.PROD;
const devtool = mode === WebpackMode.DEVEL ? 'source-map' : 'nosources-source-map';

export const targetBrowser = process.env.TARGET_BROWSER as BrowserFamily || BrowserFamily.MOZILLA;

const tsLoader: RuleSetUseItem = {
  loader: 'ts-loader',
  options: {
    configFile: path.resolve(__dirname, 'tsconfig.json'),
  },
};

export const commonConfiguration: Configuration = {
  mode,
  devtool,
  stats: 'errors-only',
  output: {
    path: path.resolve(rootDir, 'dist', targetBrowser, 'src'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: srcDir,
        use: [ MiniCssExtractPlugin.loader, 'css-loader' ],
      },
      {
        test: /\.tsx?$/,
        include: srcDir,
        use: [ tsLoader ],
      },
      {
        test: /\.json$/,
        include: srcDir,
        use: [ tsLoader ],
      },
      {
        test: /\.png$/,
        include: srcDir,
        type: 'asset/inline', // base64 encoded
      },
      {
        test: /\.svg$/,
        include: srcDir,
        type: 'asset/inline', // base64 encoded
      },
      {
        test: /\.md$/,
        include: rootDir,
        type: 'asset/source', // as file content
      },
    ],
  },
  plugins: [
    ...(targetBrowser !== BrowserFamily.MOZILLA
        ? [new ProvidePlugin({ browser: 'webextension-polyfill' })]
        : []
    ),
  ],
  resolve: {
    modules: [ path.resolve(rootDir, 'node_modules') ],
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.png', '.svg', '.md' ],
    alias: {
      '@assets': path.resolve(srcDir, 'assets'),
      '@background': path.resolve(srcDir, 'background'),
      '@commons': path.resolve(srcDir, 'commons'),
      '@frontend': path.resolve(srcDir, 'frontend'),
    },
  },
};

export default commonConfiguration;
