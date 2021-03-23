import { Tabs } from 'webextension-polyfill-ts';

import type { Options } from '@pontoon-addon/commons/src/Options';
import type { RemoteLinks } from '@pontoon-addon/commons/src/RemoteLinks';

import type { RemotePontoon } from './RemotePontoon';
import { browser } from './util/webExtensionsApi';

export class ContextButtons {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;
  private readonly _remoteLinks: RemoteLinks;
  private _mozillaWebsites: string[] = [];

  constructor(
    options: Options,
    remotePontoon: RemotePontoon,
    remoteLinks: RemoteLinks
  ) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._remoteLinks = remoteLinks;
    const projectsListDataKey = 'projectsList';
    browser.storage.local
      .get(projectsListDataKey)
      .then((storageItem) =>
        this._initMozillaWebsitesList(storageItem[projectsListDataKey])
      )
      .then(() => {
        this._listenToMessagesFromContentScript();
        this._watchTabsUpdates();
        this._refreshContextButtonsInAllTabs();
        remotePontoon.subscribeToProjectsListChange((change) =>
          this._initMozillaWebsitesList(change.newValue)
        );
      });
  }

  private _initMozillaWebsitesList(projects: any): void {
    if (projects) {
      this._mozillaWebsites = [];
      Object.values(projects).forEach((project: any) =>
        project.domains.forEach((domain: string) =>
          this._mozillaWebsites.push(`https://${domain}`)
        )
      );
      Object.freeze(this._mozillaWebsites);
    }
  }

  private _watchTabsUpdates(): void {
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && this._isSupportedPage(tab.url)) {
        this._injectContextButtonsScript(tab);
      }
    });
  }

  private _refreshContextButtonsInAllTabs(): void {
    browser.tabs.query({}).then((tabs) =>
      tabs.forEach((tab) => {
        if (this._isSupportedPage(tab.url)) {
          this._injectContextButtonsScript(tab);
        }
      })
    );
  }

  private _listenToMessagesFromContentScript(): void {
    browser.runtime.onMessage.addListener((request, sender) => {
      switch (request.type) {
        case 'pontoon-search-context-button-clicked':
          browser.tabs.create({
            url: this._remotePontoon.getSearchInAllProjectsUrl(request.text),
          });
          break;
        case 'bugzilla-report-context-button-clicked': {
          const localeTeamOptionKey = 'locale_team';
          const teamsListDataKey = 'teamsList';
          Promise.all([
            this._options.get(localeTeamOptionKey) as Promise<any>,
            browser.storage.local.get(teamsListDataKey),
          ]).then(([optionsItems, storageItems]) => {
            const teamCode = optionsItems[localeTeamOptionKey];
            const team = storageItems[teamsListDataKey][teamCode];
            browser.tabs.create({
              url: this._remoteLinks.getBugzillaReportUrlForSelectedTextOnPage(
                request.text,
                sender.url!,
                team.code,
                team.bz_component
              ),
            });
          });
          break;
        }
      }
    });
  }

  private _isSupportedPage(url: string | undefined): boolean {
    if (url) {
      return this._mozillaWebsites.some((it) => url.startsWith(it));
    } else {
      return false;
    }
  }

  private _injectContextButtonsScript(tab: Tabs.Tab): void {
    browser.tabs.executeScript(tab.id, {
      file: '/packages/content-scripts/dist/context-buttons.js',
    });
  }
}
