import { Tabs } from 'webextension-polyfill';

import type { Options } from '@commons/Options';
import { pontoonSearchInProject, newLocalizationBug } from '@commons/webLinks';
import {
  browser,
  getOneFromStorage,
  openNewTab,
} from '@commons/webExtensionsApi';

import type { ProjectsList, RemotePontoon } from './RemotePontoon';

export class ContextButtons {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private mozillaWebsites: string[] = [];

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this.options = options;
    this.remotePontoon = remotePontoon;
    getOneFromStorage('projectsList').then((projectsList) => {
      this.initMozillaWebsitesList(projectsList);
      this.listenToMessagesFromContentScript();
      this.watchTabsUpdates();
      this.refreshContextButtonsInAllTabs();
      remotePontoon.subscribeToProjectsListChange((change) =>
        this.initMozillaWebsitesList(change.newValue),
      );
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

  private refreshContextButtonsInAllTabs(): void {
    browser.tabs.query({}).then((tabs) =>
      tabs.forEach((tab) => {
        if (this.isSupportedPage(tab.url)) {
          this.injectContextButtonsScript(tab);
        }
      }),
    );
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
          const localeTeamOptionKey = 'locale_team';
          Promise.all([
            this.options.get(localeTeamOptionKey),
            getOneFromStorage('teamsList'),
          ]).then(([optionsItems, teamsList]) => {
            const teamCode = optionsItems[localeTeamOptionKey] as string;
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
