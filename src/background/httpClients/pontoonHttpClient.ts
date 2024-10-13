import type { WebRequest } from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

import { browser } from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';
import { doAsync } from '@commons/utils';

const PONTOON_REQUEST_TOKEN_HEADER = 'pontoon-addon-token';
const PONTOON_REQUEST_TOKEN_STORAGE_KEY_PREFIX = 'pontoon_req_token_';
const PONTOON_REQUEST_TOKEN_VALIDITY_SECONDS = 60;

interface TokenInfo {
  issued: string; // ISO date
}

export function init() {
  listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) =>
    listenForRequestsToPontoon(pontoonBaseUrl),
  );
  doAsync(async () => {
    listenForRequestsToPontoon(await getPontoonBaseUrl());
  });
}

async function getPontoonBaseUrl(): Promise<string> {
  return await getOneOption('pontoon_base_url');
}

async function listenForRequestsToPontoon(pontoonBaseUrl: string) {
  if (browser.webRequest) {
    await browser.webRequest.onBeforeSendHeaders.removeListener(
      setSessionCookieForPontoonRequest,
    );
    await browser.webRequest.onBeforeSendHeaders.addListener(
      setSessionCookieForPontoonRequest,
      { urls: [`${pontoonBaseUrl}/*`] },
      ['blocking', 'requestHeaders'],
    );
  }
}

async function fetchFromPontoonSession(url: string): Promise<Response> {
  const pontoonBaseUrl = await getPontoonBaseUrl();
  if (!url.startsWith(`${pontoonBaseUrl}/`)) {
    throw new Error(
      `Attempted to fetch '${url}' with Pontoon session for '${pontoonBaseUrl}'.`,
    );
  }

  const headers = new Headers();
  headers.append('X-Requested-With', 'XMLHttpRequest');
  if (browser.webRequest) {
    browser.webRequest.onBeforeSendHeaders.hasListener(
      setSessionCookieForPontoonRequest,
    ) || (await listenForRequestsToPontoon(pontoonBaseUrl));
    headers.append(
      PONTOON_REQUEST_TOKEN_HEADER,
      await issueNewPontoonRequestToken(),
    );
    return fetch(url, { credentials: 'omit', headers });
  } else {
    return fetch(url, { credentials: 'include', headers });
  }
}

function tokenStorageKey(token: string) {
  return `${PONTOON_REQUEST_TOKEN_STORAGE_KEY_PREFIX}_${token}`;
}

async function issueNewPontoonRequestToken(): Promise<string> {
  const token = uuidv4();
  const tokenInfo: TokenInfo = {
    issued: new Date().toISOString(),
  };
  await browser.storage.session.set({
    [tokenStorageKey(token)]: JSON.stringify(tokenInfo),
  });
  return token;
}

async function verifyPontoonRequestToken(
  token: string | undefined,
): Promise<boolean> {
  if (token) {
    const storageKey = tokenStorageKey(token);
    const tokenInfoValue = (
      (await browser.storage.session.get(storageKey)) as Record<string, string>
    )[storageKey];
    if (typeof tokenInfoValue === 'string') {
      const tokenInfo: TokenInfo = JSON.parse(tokenInfoValue);
      const tokenAgeSeconds =
        (Date.now() - new Date(tokenInfo.issued).getTime()) / 1000;
      await browser.storage.session.remove(storageKey);
      return tokenAgeSeconds < PONTOON_REQUEST_TOKEN_VALIDITY_SECONDS;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

async function setSessionCookieForPontoonRequest(
  details: WebRequest.OnBeforeSendHeadersDetailsType,
): Promise<WebRequest.BlockingResponse> {
  const pontoonBaseUrl = await getPontoonBaseUrl();
  if (!details.url.startsWith(`${pontoonBaseUrl}/`)) {
    console.warn(
      `Observed a request to '${details.url}', but Pontoon is at '${pontoonBaseUrl}'. Request passed unchanged.`,
    );
    return details;
  }

  const tokens = (details.requestHeaders ?? [])
    .filter(
      (header) => header.name.toLowerCase() === PONTOON_REQUEST_TOKEN_HEADER,
    )
    .map((header) => header.value);
  const isMarked =
    tokens.length > 0 &&
    (
      await Promise.all([
        tokens.map((token) => verifyPontoonRequestToken(token)),
      ])
    ).every((verified) => verified);

  if (!isMarked) {
    return details;
  } else {
    const {
      contextual_identity: contextualIdentity,
      pontoon_base_url: pontoonBaseUrl,
    } = await getOptions(['contextual_identity', 'pontoon_base_url']);
    const cookie = await browser.cookies.get({
      url: pontoonBaseUrl,
      name: 'sessionid',
      storeId: contextualIdentity,
    });
    const requestHeaders = (details.requestHeaders ?? [])
      .filter(
        (header) => header.name.toLowerCase() !== PONTOON_REQUEST_TOKEN_HEADER,
      )
      .filter((header) => header.name.toLowerCase() !== 'cookie')
      .concat(
        ...(cookie
          ? [
              {
                name: 'Cookie',
                value: `${cookie.name}=${cookie.value}`,
              },
            ]
          : []),
      );
    return {
      ...details,
      requestHeaders,
    };
  }
}

export const pontoonHttpClient = {
  fetchFromPontoonSession,
};
