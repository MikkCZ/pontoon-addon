import path from 'path';
import type { Configuration, RuleSetUseItem } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import GenerateJsonPlugin from 'generate-json-webpack-plugin';
import WebExtPlugin from 'web-ext-plugin';

import { getManifestFor, BrowserFamily } from '../src/manifest.json';

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

enum WebpackMode {
  PROD = 'production',
  DEVEL = 'development',
}

const mode = process.env.MODE === WebpackMode.DEVEL ? WebpackMode.DEVEL : WebpackMode.PROD;
const devtool = mode === WebpackMode.DEVEL ? 'source-map' : 'nosources-source-map';

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

const commonFrontendWebpackPluginOptions: HtmlWebpackPlugin.Options = {
  template: path.resolve(srcDir, 'frontend/index.html.ejs'),
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
    name: `${targetBrowser}/src/frontend`,
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
        filename: 'frontend/options.html',
        title: 'Pontoon Add-on - Settings',
        rootId: 'options-root',
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
    name: `${targetBrowser}/src/manifest.json`,
    ...commonConfiguration,
    entry: './package.json', // anything webpack can load by itself
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
  {
    name: `${targetBrowser}/web-ext`,
    dependencies: [
      `${targetBrowser}/src/background`,
      `${targetBrowser}/src/content-scripts`,
      `${targetBrowser}/src/frontend`,
      `${targetBrowser}/src/manifest.json`,
    ],
    ...commonConfiguration,
    entry: './package.json', // anything webpack can load by itself
    output: {
      ...commonConfiguration.output,
      // ignore chunk emitted from the entry
      filename: path.relative(commonConfiguration.output?.path!, '/dev/null'),
    },
    plugins: [
      new WebExtPlugin({
        runLint: true,
        buildPackage: true,
        overwriteDest: true,
        sourceDir: commonConfiguration.output?.path!,
        artifactsDir: path.resolve(commonConfiguration.output?.path!, '../web-ext'),
      }),
    ],
  },
  ...(targetBrowser === 'mozilla' ? [
      {
        name: 'privacy-policy',
        ...commonConfiguration,
        entry: './package.json', // anything webpack can load by itself
        output: {
          ...commonConfiguration.output,
          // ignore chunk emitted from the entry
          filename: path.relative(commonConfiguration.output?.path!, '/dev/null'),
          path: path.resolve(commonConfiguration.output?.path!, '..', '..'),
        },
        plugins: [
          new HtmlWebpackPlugin({
            template: path.resolve(srcDir, 'privacy-policy.html.ejs'),
            filename: 'privacy-policy.html',
            minify: false,
          }),
        ],
      }
    ] : []
  ),
];

export default configs;
