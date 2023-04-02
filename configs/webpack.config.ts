import path from 'path';
import type { Configuration } from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import GenerateJsonPlugin from 'generate-json-webpack-plugin';

import { srcDir, targetBrowser, commonConfiguration } from './webpack.common.config';
import { getManifestFor, BrowserFamily } from '../src/manifest.json';

const extensionManifestJson = getManifestFor(targetBrowser);

const commonFrontendWebpackPluginOptions: HtmlWebpackPlugin.Options = {
  template: path.resolve(srcDir, 'frontend/index.html.ejs'),
  favicon: path.resolve(srcDir, 'assets/img/pontoon-logo.svg'),
  meta: {
    viewport: 'width=device-width,initial-scale=1',
  },
};

async function configs(): Promise<Configuration[]> {
  const { default: WebExtPlugin } = await import('web-ext-plugin');
  type TargetType = 'firefox-desktop' | 'firefox-android' | 'chromium'; // copy from web-ext-plugin
  let webExtRunTarget: TargetType | undefined;
  switch (targetBrowser) {
    case BrowserFamily.MOZILLA:
      webExtRunTarget = 'firefox-desktop';
      break;
    case BrowserFamily.CHROMIUM:
      webExtRunTarget = 'chromium';
      break;
  }

  return [
    {
      ...commonConfiguration,
      name: `${targetBrowser}/src/background`,
      entry: path.resolve(srcDir, 'background/index.ts'),
      output: {
        ...commonConfiguration.output,
        filename: 'background/main.js',
      },
    },
    {
      ...commonConfiguration,
      name: `${targetBrowser}/src/content-scripts`,
      entry: {
        'content-scripts/context-buttons': path.resolve(srcDir, 'content-scripts/context-buttons.ts'),
        'content-scripts/live-data-provider': path.resolve(srcDir, 'content-scripts/live-data-provider.ts'),
        'content-scripts/notifications-bell-icon': path.resolve(srcDir, 'content-scripts/notifications-bell-icon.ts'),
        'content-scripts/pontoon-addon-promotion-content-script': path.resolve(srcDir, 'content-scripts/pontoon-addon-promotion/content-script.ts'),
        'content-scripts/pontoon-addon-promotion-in-page': path.resolve(srcDir, 'content-scripts/pontoon-addon-promotion/in-page.ts'),
      },
    },
    {
      ...commonConfiguration,
      name: `${targetBrowser}/src/frontend`,
      entry: path.resolve(srcDir, 'frontend/index.tsx'),
      output: {
        ...commonConfiguration.output,
        filename: 'frontend/main.js',
      },
      plugins: [
        ...(commonConfiguration.plugins ?? []),
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
      ...commonConfiguration,
      name: `${targetBrowser}/src/manifest.json`,
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
      ...commonConfiguration,
      name: `${targetBrowser}/web-ext`,
      dependencies: [
        `${targetBrowser}/src/background`,
        `${targetBrowser}/src/content-scripts`,
        `${targetBrowser}/src/frontend`,
        `${targetBrowser}/src/manifest.json`,
      ],
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
          outputFilename: `${(extensionManifestJson.name as string).toLowerCase().replace(' ', '_')}-${extensionManifestJson.version}-${targetBrowser}.zip`,
          overwriteDest: true,
          sourceDir: commonConfiguration.output?.path!,
          artifactsDir: path.resolve(commonConfiguration.output?.path!, '../web-ext'),
          target: webExtRunTarget,
        }),
      ],
    },
    ...(targetBrowser === BrowserFamily.MOZILLA ? [
        {
          ...commonConfiguration,
          name: 'privacy-policy',
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
              filename: `privacy-policy-${extensionManifestJson.version}.html`,
              minify: false,
            }),
          ],
        }
      ] : []
    ),
  ];
}

export default configs;
