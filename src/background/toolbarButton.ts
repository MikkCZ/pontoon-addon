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
  pontoonAddonWiki,
} from '@commons/webLinks';
import { openNewPontoonTab } from '@commons/utils';
import { colors } from '@frontend/commons/const';

import { refreshData } from './RemotePontoon';

const DEFAULT_TITLE = 'Pontoon notifications';

export function init() {
  registerBadgeChanges();
  registerClickAction();

  addContextMenu();
}

async function registerBadgeChanges() {
  listenToStorageChange(
    'notificationsData',
    ({ newValue: notificationsData }) => {
      if (notificationsData) {
        updateBadge({ notificationsData });
      } else {
        updateBadge();
      }
    },
  );
  listenToStorageChange(
    'notificationsDataLoadingState',
    ({ newValue: notificationsDataLoadingState }) => {
      if (notificationsDataLoadingState) {
        updateBadge({ notificationsDataLoadingState });
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
  data?: Partial<
    Pick<StorageContent, 'notificationsDataLoadingState' | 'notificationsData'>
  >,
) {
  const notificationsDataLoadingState =
    data?.notificationsDataLoadingState ??
    (await getOneFromStorage('notificationsDataLoadingState'));
  const notificationsData =
    data?.notificationsData ?? (await getOneFromStorage('notificationsData'));

  if (
    (typeof notificationsDataLoadingState === 'undefined' ||
      notificationsDataLoadingState === 'loaded') &&
    typeof notificationsData === 'object'
  ) {
    if (await getOneOption('display_toolbar_button_badge')) {
      const unreadNotificationsCount = Object.values(notificationsData).filter(
        (n) => n.unread,
      ).length;
      await loadedBadge(unreadNotificationsCount);
    }
  } else if (notificationsDataLoadingState === 'loading') {
    await loadingBadge();
  } else {
    await errorBadge();
  }
}

async function loadedBadge(unreadNotificationsCount: number) {
  if (unreadNotificationsCount > 0) {
    await setBadge({
      text: `${unreadNotificationsCount}`,
      title: `${DEFAULT_TITLE} (${unreadNotificationsCount})`,
      color: colors.interactive.red,
    });
  } else {
    await setBadge({
      text: '', // hide badge
      title: DEFAULT_TITLE,
      color: colors.interactive.gray,
    });
  }
}

async function loadingBadge() {
  await setBadge({
    text: '🗘',
    title: DEFAULT_TITLE,
    color: colors.interactive.gray,
  });
}

async function errorBadge() {
  await setBadge({
    text: '!',
    title: DEFAULT_TITLE,
    color: colors.interactive.red,
  });
}

async function setBadge(data: { text: string; title: string; color: string }) {
  const { text, title, color } = data;
  await Promise.all([
    browser.browserAction.setBadgeText({ text }),
    browser.browserAction.setTitle({ title }),
    browser.browserAction.setBadgeBackgroundColor({ color }),
  ]);
}

async function addContextMenu() {
  const localeTeam = await getOneOption('locale_team');
  createContextMenu({
    title: 'Reload notifications',
    contexts: ['browser_action'],
    onclick: async () => {
      await refreshData({ event: 'user interaction' });
    },
  });

  const localeTeamParentItemId = createContextMenu({
    title: 'Locale Team',
    contexts: ['browser_action'],
  });
  const localeTeamMenuItems: Menus.CreateCreatePropertiesType[] = [
    {
      title: 'Dashboard',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(pontoonTeam(pontoonBaseUrl, { code: teamCode }));
      },
    },
    {
      title: 'Insights',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(
          pontoonTeamInsights(pontoonBaseUrl, { code: teamCode }),
        );
      },
    },
    {
      title: 'Bugs',
      onclick: async () => {
        const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
          await getOptions(['pontoon_base_url', 'locale_team']);
        openNewPontoonTab(pontoonTeamBugs(pontoonBaseUrl, { code: teamCode }));
      },
    },
    {
      title: 'Search',
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
  for (const item of localeTeamMenuItems) {
    createContextMenu({
      ...item,
      contexts: ['browser_action'],
      parentId: localeTeamParentItemId,
    });
  }

  createContextMenu({
    title: 'Pontoon search',
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
    contexts: ['browser_action'],
  });

  createContextMenu({
    title: 'Transvision',
    onclick: () => openNewTab(transvisionHome(localeTeam)),
    contexts: ['browser_action'],
  });

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

  const pontoonAddonParentItemId = createContextMenu({
    title: 'Pontoon Add-on',
    contexts: ['browser_action'],
  });
  const pontoonAddonItems: Menus.CreateCreatePropertiesType[] = [
    {
      title: 'Wiki',
      onclick: () => openNewTab(pontoonAddonWiki()),
    },
    {
      title: 'Introduction tour',
      onclick: () => openIntro(),
    },
  ];
  for (const item of pontoonAddonItems) {
    createContextMenu({
      ...item,
      contexts: ['browser_action'],
      parentId: pontoonAddonParentItemId,
    });
  }
}
