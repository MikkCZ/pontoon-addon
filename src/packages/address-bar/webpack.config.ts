import path from 'path';
import type { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

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
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('./src/index.ejs'),
      title: 'Address Bar',
      meta: {
        viewport: 'width=device-width,initial-scale=1',
      },
      rootId: 'address-bar-root',
    }),
  ],
};

export default config;
