import { pontoonSearchInProject, newLocalizationBug } from '@commons/webLinks';
import {
  getOneFromStorage,
  getAllTabs,
  openNewTab,
  executeScript,
  listenToTabsCompletedLoading,
  StorageContent,
  listenToMessages,
} from '@commons/webExtensionsApi';
import { getOneOption, getOptions } from '@commons/options';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';

const CONTENT_SCRIPT = 'content-scripts/context-buttons.js';

export function setupPageContextButtons() {
  listenToMessagesFromContentScript();
  listenToTabsCompletedLoading(async (tab) => {
    const projects = await getOneFromStorage('projectsList');
    if (isSupportedPage(tab.url, projects)) {
      executeScript(tab.id, CONTENT_SCRIPT);
    }
  });
  getOneFromStorage('projectsList').then(async (projectsList) => {
    for (const tab of await getAllTabs()) {
      if (
        isSupportedPage(tab.url, projectsList) &&
        typeof tab.id !== 'undefined'
      ) {
        executeScript(tab.id, CONTENT_SCRIPT);
      }
    }
  });
}

function listenToMessagesFromContentScript() {
  listenToMessages(
    BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
    async (message: { text?: string }) => {
      const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
        await getOptions(['pontoon_base_url', 'locale_team']);
      openNewTab(
        pontoonSearchInProject(
          pontoonBaseUrl,
          { code: teamCode },
          { slug: 'all-projects' },
          message.text!,
        ),
      );
    },
  );
  listenToMessages(
    BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA,
    async (message: { text?: string }, { url: fromUrl }) => {
      const [teamCode, teamsList] = await Promise.all([
        getOneOption('locale_team'),
        getOneFromStorage('teamsList'),
      ]);
      const team = teamsList![teamCode];
      openNewTab(
        newLocalizationBug({
          team,
          selectedText: message.text!,
          url: fromUrl!,
        }),
      );
    },
  );
}

function isSupportedPage(
  url: string | undefined,
  projects: StorageContent['projectsList'] | undefined,
): boolean {
  if (url && projects) {
    return Object.values(projects)
      .flatMap((project) => project.domains)
      .some((domain) => url.startsWith(`https://${domain}`));
  } else {
    return false;
  }
}
