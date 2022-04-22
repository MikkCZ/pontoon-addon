import { Tabs } from 'webextension-polyfill';

import type { Options } from '@commons/Options';
import type { RemoteLinks } from '@commons/RemoteLinks';
import { browser } from '@commons/webExtensionsApi';

import type {
  ProjectsList,
  ProjectsListInStorage,
  RemotePontoon,
  TeamsListInStorage,
} from './RemotePontoon';

export class ContextButtons {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private readonly remoteLinks: RemoteLinks;
  private mozillaWebsites: string[] = [];

  constructor(
    options: Options,
    remotePontoon: RemotePontoon,
    remoteLinks: RemoteLinks,
  ) {
    this.options = options;
    this.remotePontoon = remotePontoon;
    this.remoteLinks = remoteLinks;
    const projectsListDataKey = 'projectsList';
    browser.storage.local
      .get(projectsListDataKey)
      .then((storageItem: unknown) =>
        this.initMozillaWebsitesList(
          (storageItem as ProjectsListInStorage).projectsList,
        ),
      )
      .then(() => {
        this.listenToMessagesFromContentScript();
        this.watchTabsUpdates();
        this.refreshContextButtonsInAllTabs();
        remotePontoon.subscribeToProjectsListChange((change) =>
          this.initMozillaWebsitesList(change.newValue),
        );
      });
  }

  private initMozillaWebsitesList(projects: ProjectsList): void {
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
          browser.tabs.create({
            url: this.remotePontoon.getSearchInAllProjectsUrl(request.text),
          });
          break;
        case 'bugzilla-report-context-button-clicked': {
          const localeTeamOptionKey = 'locale_team';
          const teamsListDataKey = 'teamsList';
          Promise.all([
            this.options.get(localeTeamOptionKey),
            browser.storage.local.get(
              teamsListDataKey,
            ) as Promise<TeamsListInStorage>,
          ]).then(([optionsItems, projectListInStorage]) => {
            const teamCode = optionsItems[localeTeamOptionKey] as string;
            const team = projectListInStorage.teamsList[teamCode];
            browser.tabs.create({
              url: this.remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(
                request.text,
                sender.url!,
                team.code,
                team.bz_component,
              ),
            });
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
