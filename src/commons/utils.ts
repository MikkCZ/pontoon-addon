import { supportsContainers } from './webExtensionsApi';
import { getOneOption } from './options';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export async function hash(
  input: string,
  algorithm: AlgorithmIdentifier = 'SHA-256',
): Promise<string> {
  const inputBytes = textEncoder.encode(input);
  const hashBytes = await crypto.subtle.digest(algorithm, inputBytes);
  return textDecoder.decode(hashBytes);
}

export const doAsync = <T>(action: () => Promise<T>) => action();

export async function openNewPontoonTab(url: string) {
  return browser.tabs.create({
    url,
    ...(supportsContainers()
      ? { cookieStoreId: await getOneOption('contextual_identity') }
      : {}),
  });
}
