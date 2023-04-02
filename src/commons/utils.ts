import { supportsContainers } from './webExtensionsApi';
import { getOneOption } from './options';

export async function openNewPontoonTab(url: string) {
  return browser.tabs.create({
    url,
    ...(supportsContainers()
      ? { cookieStoreId: await getOneOption('contextual_identity') }
      : {}),
  });
}
