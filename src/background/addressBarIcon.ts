import type { Tabs } from 'webextension-polyfill';

import {
  showAddressBarIcon,
  hideAddressBarIcon,
  listenToStorageChange,
  getAllTabs,
  listenToTabsCompletedLoading,
} from '@commons/webExtensionsApi';

import { getPontoonProjectForPageUrl } from './RemotePontoon';
import { doAsync } from '@commons/utils';

export function init() {
  listenToStorageChange('projectsList', async () => {
    updatePageActions(await getAllTabs());
  });
  listenToTabsCompletedLoading((tab) => {
    updatePageActions([tab]);
  });

  doAsync(async () => {
    updatePageActions(await getAllTabs());
  });
}

async function updatePageActions(tabs: Tabs.Tab[]) {
  for (const tab of tabs) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const projectData = await getPontoonProjectForPageUrl(tab.url!);
    if (projectData) {
      showAddressBarIcon(tab, `Open ${projectData.name} in Pontoon`, {
        16: 'assets/img/pontoon-logo.svg',
        32: 'assets/img/pontoon-logo.svg',
      });
    } else {
      hideAddressBarIcon(tab, 'No project for this page');
    }
  }
}
