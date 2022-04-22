import path from 'path';
import type { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

enum WebpackModes {
  PROD = 'production',
  DEVEL = 'development',
}

const mode = process.env.MODE === WebpackModes.DEVEL ? WebpackModes.DEVEL : WebpackModes.PROD;
const devtool = mode === WebpackModes.DEVEL ? 'source-map' : undefined;

const commonConfiguration: Configuration = {
  mode,
  devtool,
  performance: {
    hints: false,
  },
  stats: 'errors-only',
  output: {
    path: path.resolve(__dirname, 'dist/src'),
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
        use: 'ts-loader',
      },
      {
        test: /\.json$/,
        exclude: /(node_modules)/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|svg)$/,
        exclude: /(node_modules)/,
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
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.png', '.svg', '.md' ],
    alias: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@background': path.resolve(__dirname, 'src/background'),
      '@commons': path.resolve(__dirname, 'src/commons'),
      '@frontend': path.resolve(__dirname, 'src/frontend'),
    },
  },
};

const commonFrontendWebpackPluginOptions: HtmlWebpackPlugin.Options = {
  template: path.resolve(__dirname, 'src/frontend/index.ejs'),
  favicon: path.resolve(__dirname, 'src/assets/img/pontoon-logo.svg'),
  meta: {
    viewport: 'width=device-width,initial-scale=1',
  },
};

const configs: Configuration[] = [
  {
    name: 'background',
    ...commonConfiguration,
    entry: path.resolve(__dirname, 'src/background/index.ts'),
    output: {
      ...commonConfiguration.output,
      filename: 'background/main.js',
    },
  },
  {
    name: 'content-scripts',
    ...commonConfiguration,
    entry: {
      'content-scripts/context-buttons': path.resolve(__dirname, 'src/content-scripts/context-buttons.ts'),
      'content-scripts/live-data-provider': path.resolve(__dirname, 'src/content-scripts/live-data-provider.ts'),
      'content-scripts/notifications-bell-icon': path.resolve(__dirname, 'src/content-scripts/notifications-bell-icon.ts'),
      'content-scripts/pontoon-addon-promotion-content-script': path.resolve(__dirname, 'src/content-scripts/pontoon-addon-promotion/content-script.ts'),
      'content-scripts/pontoon-addon-promotion-in-page': path.resolve(__dirname, 'src/content-scripts/pontoon-addon-promotion/in-page.ts'),
    },
  },
  {
    name: 'frontend',
    ...commonConfiguration,
    entry: path.resolve(__dirname, 'src/frontend/index.tsx'),
    output: {
      ...commonConfiguration.output,
      filename: 'frontend/main.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/address-bar.html',
        title: 'Address Bar',
        rootId: 'address-bar-root',
      }),
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
    name: 'options',
    ...commonConfiguration,
    entry: path.resolve(__dirname, 'src/frontend/index-options.ts'),
    output: {
      ...commonConfiguration.output,
      filename: 'frontend/options.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        ...commonFrontendWebpackPluginOptions,
        filename: 'frontend/options.html',
        template: path.resolve(__dirname, 'src/frontend/index-options.ejs'),
        title: 'Pontoon Add-on Settings',
      }),
      new MiniCssExtractPlugin({
        filename: 'frontend/options.css',
      }),
    ],
  },
  {
    name: 'manifest-json',
    mode: commonConfiguration.mode,
    entry: path.resolve(__dirname, 'src/manifest.json'),
    output: {
      ...commonConfiguration.output,
      filename: 'manifest.js',
    },
    plugins: [
      new CopyPlugin({
        patterns:[
          { from: path.resolve(__dirname, 'src/manifest.json'), to: '.' },
          { from: 'src/assets/img', to: 'assets/img' },
        ],
      }),
    ],
  },
];

export default configs;
