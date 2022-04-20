import path from 'path';
import type { Configuration } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

enum WebpackModes {
  PROD = 'production',
  DEVEL = 'development',
}

const mode = process.env.MODE === WebpackModes.DEVEL ? WebpackModes.DEVEL : WebpackModes.PROD;
const devtool = mode === WebpackModes.DEVEL ? 'source-map' : undefined;
const entry = {
  'context-buttons': path.resolve('./src/context-buttons.ts'),
  'live-data-provider': path.resolve('./src/live-data-provider.ts'),
  'notifications-bell-icon': path.resolve('./src/notifications-bell-icon.ts'),
  'pontoon-addon-promotion-content-script': path.resolve('./src/pontoon-addon-promotion/content-script.ts'),
  'pontoon-addon-promotion-in-page': path.resolve('./src/pontoon-addon-promotion/in-page.ts'),
};

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
};

export default config;
