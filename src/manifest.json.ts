import fs from 'fs';
import path from 'path';

import type { Manifest } from 'webextension-polyfill';
import type { IPackageJson } from 'package-json-type';

import { DEFAULT_PONTOON_BASE_URL } from './const';
import { projectsListData } from './background/data/projectsListData';

interface PackageJson extends IPackageJson {
  browserslist?: string[];
}

// ts-prune-ignore-next
export enum BrowserFamily {
  MOZILLA = 'mozilla',
  CHROMIUM = 'chromium',
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), {
    encoding: 'utf-8',
  }),
) as PackageJson;

function getMinBrowserVersionFromPackageJson(
  targetBrowser: BrowserFamily,
): string {
  let browserslistQueryBrowser: string;
  switch (targetBrowser) {
    case BrowserFamily.MOZILLA:
      browserslistQueryBrowser = 'Firefox';
      break;
    case BrowserFamily.CHROMIUM:
      browserslistQueryBrowser = 'Chrome';
      break;
    default:
      throw new Error(
        `No known browser specified to parse browserslist configuration. Was "${targetBrowser}", must be one of: ${Object.values(
          BrowserFamily,
        )}.`,
      );
  }
  if (packageJson.browserslist) {
    const browserslistVersionMatch = packageJson.browserslist
      .find((it) => it.startsWith(browserslistQueryBrowser))
      ?.match(/([\d.]+$)/g);
    if (browserslistVersionMatch) {
      return browserslistVersionMatch[0];
    } else {
      throw new Error(
        `Could not find "${browserslistQueryBrowser}" and it's version in browserslist configuration "${packageJson.browserslist}".`,
      );
    }
  } else {
    throw new Error('Could not find browserslist configuration.');
  }
}

const pontoonLogoSvg = 'assets/img/pontoon-logo.svg';
const pontoonLogoGrayAlphaSvg = 'assets/img/pontoon-logo-gray-alpha.svg';
const pontoonLogo32Png = 'assets/img/pontoon-logo-32.png';
const pontoonLogo128Png = 'assets/img/pontoon-logo-128.png';

// ts-prune-ignore-next
export function getManifestFor(
  targetBrowser: BrowserFamily,
  manifestVersion: 2 | 3,
): Manifest.WebExtensionManifest {
  const forMozilla = targetBrowser === BrowserFamily.MOZILLA;
  const forChromium = targetBrowser === BrowserFamily.CHROMIUM;

  if ([forMozilla, forChromium].every((forIt) => !forIt)) {
    throw new Error(
      `No known browser specified to generate manifest for. Was "${targetBrowser}", must be one of: ${Object.values(
        BrowserFamily,
      )}.`,
    );
  }

  const hostPermissions = [
    `${DEFAULT_PONTOON_BASE_URL}/*`,
    'https://flod.org/*',
    ...projectsListData
      .flatMap((project) => project.domains)
      .map((domain) => `https://${domain}/*`),
  ];

  const browserAction = {
    default_title: 'Pontoon notifications',
    ...(forMozilla
      ? {
          default_icon: pontoonLogoSvg,
        }
      : {}),
    ...(forChromium
      ? {
          default_icon: pontoonLogo32Png,
        }
      : {}),
  };

  return {
    ...(forMozilla
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'pontoon-tools@mikk.cz',
              strict_min_version: getMinBrowserVersionFromPackageJson(
                BrowserFamily.MOZILLA,
              ),
            },
          },
        }
      : {}),
    ...(forChromium
      ? {
          minimum_chrome_version: getMinBrowserVersionFromPackageJson(
            BrowserFamily.CHROMIUM,
          ),
        }
      : {}),
    manifest_version: manifestVersion,
    name: 'Pontoon Add-on',
    description: packageJson.description,
    version: packageJson.version ?? '',
    author:
      typeof packageJson.author === 'object'
        ? packageJson.author.name
        : packageJson.author,
    homepage_url: packageJson.homepage,
    icons: {
      ...(forMozilla
        ? {
            '16': pontoonLogoSvg,
            '48': pontoonLogoSvg,
            '96': pontoonLogoSvg,
            '128': pontoonLogoSvg,
          }
        : {}),
      ...(forChromium
        ? {
            '32': pontoonLogo32Png,
            '128': pontoonLogo128Png,
          }
        : {}),
    },
    permissions: [
      'storage',
      'contextMenus',
      'tabs',
      'notifications',
      'alarms',
      ...(manifestVersion === 3 ? ['scripting'] : []),
      ...(forMozilla
        ? [
            'contextualIdentities',
            'cookies',
            'webRequest',
            'webRequestBlocking',
          ]
        : []),
      ...(manifestVersion === 2 ? hostPermissions : []),
    ],
    ...(manifestVersion === 2
      ? {
          optional_permissions: ['<all_urls>'], // when Pontoon server changes
        }
      : {}),
    ...(manifestVersion === 3
      ? {
          host_permissions: hostPermissions,
          optional_host_permissions: ['<all_urls>'], // when Pontoon server changes
        }
      : {}),
    options_ui: {
      page: 'frontend/options.html',
      open_in_tab: true,
    },
    ...(manifestVersion === 2
      ? {
          browser_action: browserAction,
        }
      : {}),
    ...(manifestVersion === 3
      ? {
          action: browserAction,
        }
      : {}),
    ...(forMozilla
      ? {
          page_action: {
            ...(manifestVersion === 2
              ? {
                  browser_style: true,
                }
              : {}),
            default_icon: {
              '19': pontoonLogoGrayAlphaSvg,
              '38': pontoonLogoGrayAlphaSvg,
            },
            default_popup: 'frontend/address-bar.html',
          },
        }
      : {}),
    background: {
      persistent: false,
      scripts: ['background/main.js'],
    },
    content_scripts: [
      {
        matches: [`${DEFAULT_PONTOON_BASE_URL}/*`],
        js: ['content-scripts/notifications-bell-icon.js'],
        run_at: 'document_end',
      },
      {
        matches: projectsListData
          .flatMap((project) => project.domains)
          .map((domain) => `https://${domain}/*`),
        js: ['content-scripts/context-buttons.js'],
        run_at: 'document_end',
      },
    ],
    ...(manifestVersion === 2
      ? {
          web_accessible_resources: [
            'content-scripts/pontoon-addon-promotion-in-page.js',
          ],
        }
      : {}),
    ...(manifestVersion === 3
      ? {
          web_accessible_resources: [
            {
              resources: ['content-scripts/pontoon-addon-promotion-in-page.js'],
              matches: [`${DEFAULT_PONTOON_BASE_URL}/*`],
            },
          ],
        }
      : {}),
  };
}
