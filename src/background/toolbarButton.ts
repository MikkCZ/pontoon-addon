import type { Menus } from 'webextension-polyfill';

import type { OptionValue } from '@commons/options';
import {
  getOptions,
  getOneOption,
  listenToOptionChange,
} from '@commons/options';
import type { StorageContent } from '@commons/webExtensionsApi';
import {
  browser,
  openNewTab,
  getResourceUrl,
  listenToStorageChange,
  getOneFromStorage,
  openIntro,
  createContextMenu,
} from '@commons/webExtensionsApi';
import {
  pontoonTeam,
  pontoonTeamInsights,
  pontoonTeamBugs,
  pontoonProjectTranslationView,
  transvisionHome,
  mozillaL10nStyleGuide,
  mozillaWikiL10nTeamPage,
  microsoftTerminologySearch,
  pontoonAddonWiki,
} from '@commons/webLinks';
import { openNewPontoonTab } from '@commons/utils';
import { colors } from '@frontend/commons/const';

import { refreshData, updateNotificationsData } from './RemotePontoon';

const DEFAULT_TITLE = 'Pontoon notifications';

export function setupToolbarButton() {
  registerBadgeChanges();
  registerClickAction();

  addContextMenu();
}

async function registerBadgeChanges() {
  listenToStorageChange(
    'notificationsData',
    ({ newValue: notificationsData }) => {
      // let notificationsDataLoadingState = "loading";
      // notificationsDataLoadingState = refreshData();
      // try {
      //   notificationsDataLoadingState = "loaded";
      //   await updateNotificationsData();
        // browser.browserAction.setBadgeBackgroundColor({colors.interactive.gray});
        // } catch {
          //   notificationsDataLoadingState = "error";
        // }
      if (notificationsData) {
        const color = colors.interactive.gray;
        browser.browserAction.setBadgeBackgroundColor({color});
        browser.browserAction.setIcon({path: './assests/img/spinner-solid.svg'});
        updateBadge(notificationsData);
      } else {
        updateBadge();
      }
    },
  );
  listenToOptionChange('display_toolbar_button_badge', () => {
    updateBadge();
  });
  await updateBadge();
}

async function registerClickAction() {
  browser.browserAction.onClicked.addListener(() => buttonClickHandler());
  listenToOptionChange('toolbar_button_action', ({ newValue: action }) => {
    registerButtonPopup(action);
  });
  registerButtonPopup(await getOneOption('toolbar_button_action'));
}

async function buttonClickHandler() {
  const {
    toolbar_button_action: action,
    pontoon_base_url: pontoonBaseUrl,
    locale_team: teamCode,
  } = await getOptions([
    'toolbar_button_action',
    'pontoon_base_url',
    'locale_team',
  ]);
  switch (action) {
    case 'popup':
      break;
    case 'home-page':
      await openNewPontoonTab(await getOneOption('pontoon_base_url'));
      break;
    case 'team-page':
      await openNewPontoonTab(pontoonTeam(pontoonBaseUrl, { code: teamCode }));
      break;
    default:
      throw new Error(`Unknown toolbar button action '${action}'.`);
  }
}

function registerButtonPopup(action: OptionValue<'toolbar_button_action'>) {
  let popup;
  switch (action) {
    case 'popup':
      popup = getResourceUrl('frontend/toolbar-button.html');
      break;
    case 'home-page':
    case 'team-page':
      popup = '';
      break;
    default:
      throw new Error(`Unknown toolbar button action '${action}'.`);
  }
  browser.browserAction.setPopup({ popup });
}

async function updateBadge(
  notificationsData?: Partial<StorageContent>['notificationsData'],
) {
  if (typeof notificationsData === 'undefined') {
    notificationsData = await getOneFromStorage('notificationsData');
  }

  if (typeof notificationsData !== 'undefined') {
    if (await getOneOption('display_toolbar_button_badge')) {
      const text = `${Object.values(notificationsData).filter((n) => n.unread).length
        }`;
      if (text === '0') {
        hideBadge();
      } else {
        const color = colors.interactive.red;
        await Promise.all([
          browser.browserAction.setIcon(),
          browser.browserAction.setBadgeText({ text }),
          browser.browserAction.setTitle({
            title: `${DEFAULT_TITLE} (${text})`,
          }),
          browser.browserAction.setBadgeBackgroundColor({ color }),
        ]);
      }
    }
  } else {
    const text = '!';
    const color = colors.interactive.red;
    await Promise.all([
      browser.browserAction.setBadgeText({ text }),
      browser.browserAction.setTitle({ title: `${DEFAULT_TITLE} (${text})` }),
      browser.browserAction.setBadgeBackgroundColor({ color }),
    ]);
  }
}

async function hideBadge() {
  await Promise.all([
    browser.browserAction.setBadgeText({ text: '' }),
    browser.browserAction.setTitle({ title: DEFAULT_TITLE }),
  ]);
}

async function addContextMenu() {
  const localeTeam = await getOneOption('locale_team');
  createContextMenu({
    title: 'Reload notifications',
    contexts: ['browser_action'],
    onclick: async () => {
      await hideBadge();
      refreshData();
    },
  });

  const pontoonPagesParentItemId = createContextMenu({
    title: 'Pontoon',
    contexts: ['browser_action'],
  });
  const pontoonPagesMenuItems: Menus.CreateCreatePropertiesType[] = [
    {
      title: 'Team dashboard',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(pontoonTeam(pontoonBaseUrl, { code: teamCode }));
      },
    },
    {
      title: 'Team insights',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(
          pontoonTeamInsights(pontoonBaseUrl, { code: teamCode }),
        );
      },
    },
    {
      title: 'Team bugs',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(pontoonTeamBugs(pontoonBaseUrl, { code: teamCode }));
      },
    },
    {
      title: 'Search in Pontoon',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(
          pontoonProjectTranslationView(
            pontoonBaseUrl,
            { code: teamCode },
            { slug: 'all-projects' },
          ),
        );
      },
    },
  ];
  for (const item of pontoonPagesMenuItems) {
    createContextMenu({
      ...item,
      contexts: ['browser_action'],
      parentId: pontoonPagesParentItemId,
    });
  }

  const searchMenuParentItemId = createContextMenu({
    title: 'Search l10n',
    contexts: ['browser_action'],
  });
  const searchMenuItems: Menus.CreateCreatePropertiesType[] = [
    {
      title: 'Search in Pontoon',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(
          pontoonProjectTranslationView(
            pontoonBaseUrl,
            { code: teamCode },
            { slug: 'all-projects' },
          ),
        );
      },
    },
    {
      title: 'Transvision',
      onclick: () => openNewTab(transvisionHome(localeTeam)),
    },
    {
      title: 'Microsoft Terminology Search',
      onclick: () => openNewTab(microsoftTerminologySearch()),
    },
  ];
  for (const item of searchMenuItems) {
    createContextMenu({
      ...item,
      contexts: ['browser_action'],
      parentId: searchMenuParentItemId,
    });
  }

  const localizationResourcesParentItemId = createContextMenu({
    title: 'Other l10n sources',
    contexts: ['browser_action'],
  });
  const localizationResourcesItems: Menus.CreateCreatePropertiesType[] = [
    {
      title: `Mozilla Style Guide (${localeTeam})`,
      onclick: () => openNewTab(mozillaL10nStyleGuide(localeTeam)),
    },
    {
      title: `L10n:Teams:${localeTeam} - MozillaWiki`,
      onclick: () => openNewTab(mozillaWikiL10nTeamPage(localeTeam)),
    },
  ];
  for (const item of localizationResourcesItems) {
    createContextMenu({
      ...item,
      contexts: ['browser_action'],
      parentId: localizationResourcesParentItemId,
    });
  }

  createContextMenu({
    title: 'Pontoon Add-on wiki',
    contexts: ['browser_action'],
    onclick: () => openNewTab(pontoonAddonWiki()),
  });

  createContextMenu({
    title: 'Pontoon Add-on tour',
    contexts: ['browser_action'],
    onclick: () => openIntro(),
  });
}
