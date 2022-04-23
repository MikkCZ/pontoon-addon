import path from 'path';
import type { Configuration, RuleSetUseItem } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import GenerateJsonPlugin from 'generate-json-webpack-plugin';

import { getManifestFor, BrowserFamily } from '../src/manifest.json';

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

enum WebpackModes {
  PROD = 'production',
  DEVEL = 'development',
}

const mode = process.env.MODE === WebpackModes.DEVEL ? WebpackModes.DEVEL : WebpackModes.PROD;
const devtool = mode === WebpackModes.DEVEL ? 'source-map' : undefined;

const targetBrowser = process.env.TARGET_BROWSER as BrowserFamily || BrowserFamily.MOZILLA;
const extensionManifestJson = getManifestFor(targetBrowser);

const tsLoader: RuleSetUseItem = {
  loader: 'ts-loader',
  options: {
      configFile: path.resolve(__dirname, 'tsconfig.json'),
  },
};

const commonConfiguration: Configuration = {
  mode,
  devtool,
  performance: {
    hints: false,
  },
  stats: 'errors-only',
  output: {
    path: path.resolve(rootDir, 'dist', targetBrowser, 'src'),
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /(node_modules)/,
        use: [ MiniCssExtractPlugin.loader, 'css-loader' ],
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: [ tsLoader ],
      },
      {
        test: /\.json$/,
        exclude: /(node_modules)/,
        use: [ tsLoader ],
      },
      {
        test: /\.png$/,
        exclude: /(node_modules)/,
        type: 'asset/inline', // base64 encoded
      },
      {
        test: /\.svg$/,
        exclude: /(node_modules)/,
        type: 'asset/inline', // base64 encoded
      },
      {
        test: /\.md$/,
        exclude: /(node_modules)/,
        type: 'asset/source', // as file content
      },
    ],
  },
  resolve: {
    modules: [ 'node_modules' ],
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.png', '.svg', '.md' ],
    alias: {
      '@assets': path.resolve(srcDir, 'assets'),
      '@background': path.resolve(srcDir, 'background'),
      '@commons': path.resolve(srcDir, 'commons'),
      '@frontend': path.resolve(srcDir, 'frontend'),
    },
  },
};

const commonFrontendWebpackPluginOptions: HtmlWebpackPlugin.Options = {
  template: path.resolve(srcDir, 'frontend/index.ejs'),
  favicon: path.resolve(srcDir, 'assets/img/pontoon-logo.svg'),
  meta: {
    viewport: 'width=device-width,initial-scale=1',
  },
};

const configs: Configuration[] = [
  {
    name: `${targetBrowser}/src/background`,
    ...commonConfiguration,
    entry: path.resolve(srcDir, 'background/index.ts'),
    output: {
      ...commonConfiguration.output,
      filename: 'background/main.js',
    },
  },
  {
    name: `${targetBrowser}/src/content-scripts`,
    ...commonConfiguration,
    entry: {
      'content-scripts/context-buttons': path.resolve(srcDir, 'content-scripts/context-buttons.ts'),
      'content-scripts/live-data-provider': path.resolve(srcDir, 'content-scripts/live-data-provider.ts'),
      'content-scripts/notifications-bell-icon': path.resolve(srcDir, 'content-scripts/notifications-bell-icon.ts'),
      'content-scripts/pontoon-addon-promotion-content-script': path.resolve(srcDir, 'content-scripts/pontoon-addon-promotion/content-script.ts'),
      'content-scripts/pontoon-addon-promotion-in-page': path.resolve(srcDir, 'content-scripts/pontoon-addon-promotion/in-page.ts'),
    },
  },
  {
    name: `${targetBrowser}/src/frontend/index`,
    ...commonConfiguration,
    entry: path.resolve(srcDir, 'frontend/index.tsx'),
    output: {
      ...commonConfiguration.output,
      filename: 'frontend/main.js',
    },
    plugins: [
      ...(extensionManifestJson.page_action
        ? [
          new HtmlWebpackPlugin({
            ...commonFrontendWebpackPluginOptions,
            filename: 'frontend/address-bar.html',
            title: 'Address Bar',
            rootId: 'address-bar-root',
          })
        ]: []
      ),
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/intro.html',
        title: 'Pontoon Add-on tour',
        rootId: 'intro-root',
      }),
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/privacy-policy.html',
        title: 'Pontoon Add-on - Privacy Policy',
        rootId: 'privacy-policy-root',
      }),
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/snake-game.html',
        title: 'Pontoon Snake',
        rootId: 'snake-game-root',
      }),
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/toolbar-button.html',
        title: 'Toolbar Button',
        rootId: 'toolbar-button-root',
      }),
      new MiniCssExtractPlugin({
        filename: 'frontend/main.css',
      }),
    ],
  },
  {
    name: `${targetBrowser}/src/frontend/options`,
    ...commonConfiguration,
    entry: path.resolve(srcDir, 'frontend/index-options.ts'),
    output: {
      ...commonConfiguration.output,
      filename: 'frontend/options.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/options.html',
        template: path.resolve(srcDir, 'frontend/index-options.ejs'),
        title: 'Pontoon Add-on Settings',
      }),
      new MiniCssExtractPlugin({
        filename: 'frontend/options.css',
      }),
    ],
  },
  {
    name: `${targetBrowser}/src/manifest.json`,
    mode: commonConfiguration.mode,
    entry: './package.json', // anything webpack can load
    output: {
      ...commonConfiguration.output,
      // ignore chunk emitted from the entry
      filename: path.relative(commonConfiguration.output?.path!, '/dev/null'),
    },
    plugins: [
      new GenerateJsonPlugin('manifest.json', extensionManifestJson) as any,
      new CopyPlugin({
        patterns:[
          { from: 'src/assets/img/pontoon-logo*', to: '..' }, // overlap the source 'src' with dist 'src'
        ],
      }),
    ],
  },
];

export default configs;
