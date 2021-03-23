import path from 'path';
import type { Configuration } from 'webpack';

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
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    modules: [ 'node_modules' ],
    extensions: [ '.js', '.ts', '.json', '.jsx', '.tsx', '.css' ],
    alias: {
      '@pontoon-addon/commons': path.resolve('../commons/'),
    },
  },
};

export default config;
