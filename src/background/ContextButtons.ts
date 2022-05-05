import { pontoonSearchInProject, newLocalizationBug } from '@commons/webLinks';
import {
  getOneFromStorage,
  getAllTabs,
  listenToStorageChange,
  openNewTab,
  executeScript,
  listenToTabsCompletedLoading,
  StorageContent,
} from '@commons/webExtensionsApi';
import { getOneOption, getOptions } from '@commons/options';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';
import { listenToMessages } from './backgroundClient';

export class ContextButtons {
  private mozillaWebsites: string[] = [];

  constructor() {
    getOneFromStorage('projectsList').then((projectsList) => {
      this.initMozillaWebsitesList(projectsList);
      this.listenToMessagesFromContentScript();
      this.listenToTabsUpdates();
      this.refreshContextButtonsInAllTabs();
      listenToStorageChange('projectsList', ({ newValue: newProjectsList }) => {
        this.initMozillaWebsitesList(newProjectsList);
      });
    });
  }

  private initMozillaWebsitesList(
    projects?: StorageContent['projectsList'],
  ): void {
    if (projects) {
      this.mozillaWebsites = [];
      Object.values(projects).forEach((project) =>
        project.domains.forEach((domain) =>
          this.mozillaWebsites.push(`https://${domain}`),
        ),
      );
      Object.freeze(this.mozillaWebsites);
    }
  }

  private listenToTabsUpdates(): void {
    listenToTabsCompletedLoading((tab) => {
      if (this.isSupportedPage(tab.url)) {
        this.injectContextButtonsScript(tab.id);
      }
    });
  }

  private async refreshContextButtonsInAllTabs(): Promise<void> {
    for (const tab of await getAllTabs()) {
      if (this.isSupportedPage(tab.url) && typeof tab.id !== 'undefined') {
        this.injectContextButtonsScript(tab.id);
      }
    }
  }

  private listenToMessagesFromContentScript(): void {
    listenToMessages(
      (
        message: { type: BackgroundClientMessageType; text?: string },
        { url: fromUrl },
      ) => {
        switch (message.type) {
          case BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON:
            getOptions(['pontoon_base_url', 'locale_team']).then(
              ({ pontoon_base_url: pontoonBaseUrl, locale_team: teamCode }) => {
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
            break;
          case BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA: {
            Promise.all([
              getOneOption('locale_team'),
              getOneFromStorage('teamsList'),
            ]).then(([teamCode, teamsList]) => {
              const team = teamsList![teamCode];
              openNewTab(
                newLocalizationBug({
                  team,
                  selectedText: message.text!,
                  url: fromUrl!,
                }),
              );
            });
            break;
          }
        }
      },
    );
  }

  private isSupportedPage(url: string | undefined): boolean {
    if (url) {
      return this.mozillaWebsites.some((it) => url.startsWith(it));
    } else {
      return false;
    }
  }

  private injectContextButtonsScript(tabId: number): void {
    executeScript(tabId, 'content-scripts/context-buttons.js');
  }
}
