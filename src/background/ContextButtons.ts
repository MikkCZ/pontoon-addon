import { Tabs } from 'webextension-polyfill';

import { pontoonSearchInProject, newLocalizationBug } from '@commons/webLinks';
import {
  browser,
  getOneFromStorage,
  listenToStorageChange,
  openNewTab,
} from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';

import type { ProjectsList, RemotePontoon } from './RemotePontoon';

export class ContextButtons {
  private readonly remotePontoon: RemotePontoon;
  private mozillaWebsites: string[] = [];

  constructor(remotePontoon: RemotePontoon) {
    this.remotePontoon = remotePontoon;
    getOneFromStorage('projectsList').then((projectsList) => {
      this.initMozillaWebsitesList(projectsList);
      this.listenToMessagesFromContentScript();
      this.watchTabsUpdates();
      this.refreshContextButtonsInAllTabs();
      listenToStorageChange('projectsList', ({ newValue: newProjectsList }) => {
        this.initMozillaWebsitesList(newProjectsList);
      });
    });
  }

  private initMozillaWebsitesList(projects?: ProjectsList): void {
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

  private watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && this.isSupportedPage(tab.url)) {
        this.injectContextButtonsScript(tab);
      }
    });
  }

  private async refreshContextButtonsInAllTabs(): Promise<void> {
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (this.isSupportedPage(tab.url)) {
        this.injectContextButtonsScript(tab);
      }
    }
  }

  private listenToMessagesFromContentScript(): void {
    browser.runtime.onMessage.addListener((request, sender) => {
      switch (request.type) {
        case 'pontoon-search-context-button-clicked':
          openNewTab(
            pontoonSearchInProject(
              this.remotePontoon.getBaseUrl(),
              this.remotePontoon.getTeam(),
              { slug: 'all-projects' },
              request.text,
            ),
          );
          break;
        case 'bugzilla-report-context-button-clicked': {
          Promise.all([
            getOneOption('locale_team'),
            getOneFromStorage('teamsList'),
          ]).then(([teamCode, teamsList]) => {
            const team = teamsList![teamCode];
            openNewTab(
              newLocalizationBug({
                team,
                selectedText: request.text,
                url: sender.url!,
              }),
            );
          });
          break;
        }
      }
    });
  }

  private isSupportedPage(url: string | undefined): boolean {
    if (url) {
      return this.mozillaWebsites.some((it) => url.startsWith(it));
    } else {
      return false;
    }
  }

  private injectContextButtonsScript(tab: Tabs.Tab): void {
    browser.tabs.executeScript(tab.id, {
      file: 'content-scripts/context-buttons.js',
    });
  }
}
