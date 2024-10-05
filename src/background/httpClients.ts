import type { WebRequest } from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';
import { gql } from 'graphql-tag';
import { GraphQLClient } from 'graphql-request';

import { browser } from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';

import type {
  GetProjectsInfoQuery,
  GetTeamsInfoQuery,
} from '../generated/pontoon.graphql';
import { getSdk } from '../generated/pontoon.graphql';

import { pontoonGraphQL } from './apiEndpoints';

const PONTOON_REQUEST_TOKEN_STORAGE_KEY_PREFIX = 'pontoon_req_token_';
const PONTOON_REQUEST_TOKEN_VALIDITY_SECONDS = 60;

interface TokenInfo {
  issued: string; // ISO date
}

async function listenForRequestsToPontoon(pontoonBaseUrl?: string) {
  if (browser.webRequest) {
    if (typeof pontoonBaseUrl === 'undefined') {
      pontoonBaseUrl = await getOneOption('pontoon_base_url');
    }
    browser.webRequest.onBeforeSendHeaders.removeListener(
      setSessionCookieForPontoonRequest,
    );
    browser.webRequest.onBeforeSendHeaders.addListener(
      setSessionCookieForPontoonRequest,
      { urls: [`${pontoonBaseUrl}/*`] },
      ['blocking', 'requestHeaders'],
    );
  }
}

async function fetchFromPontoonSession(url: string): Promise<Response> {
  const pontoonBaseUrl = await getOneOption('pontoon_base_url');
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
    ) || (await listenForRequestsToPontoon());
    headers.append('pontoon-addon-token', await issueNewPontoonRequestToken());
    return fetch(url, { credentials: 'omit', headers: headers });
  } else {
    return fetch(url, { credentials: 'include', headers: headers });
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
    const tokenInfoValue: string | undefined = (
      await browser.storage.session.get(storageKey)
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
  const pontoonBaseUrl = await getOneOption('pontoon_base_url');
  if (!details.url.startsWith(`${pontoonBaseUrl}/`)) {
    console.warn(
      `Observed a request to '${details.url}', but Pontoon is at '${pontoonBaseUrl}'. Request passed unchanged.`,
    );
    return details;
  }

  const tokens = (details.requestHeaders ?? [])
    .filter((header) => header.name.toLowerCase() === 'pontoon-addon-token')
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
      .filter((header) => header.name.toLowerCase() !== 'pontoon-addon-token')
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

listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) => {
  listenForRequestsToPontoon(pontoonBaseUrl);
});
listenForRequestsToPontoon();

export const pontoonHttpClient = {
  fetchFromPontoonSession,
};

export const httpClient = {
  fetch: async (url: string): Promise<Response> => {
    return await fetch(url, { credentials: 'omit' });
  },
};

type DeepRequired<T> = T extends object
  ? Required<{
      [P in keyof T]: DeepRequired<T[P]>;
    }>
  : Required<T>;

type DeepNonNullable<T> = T extends object
  ? NonNullable<{
      [P in keyof T]: DeepNonNullable<T[P]>;
    }>
  : NonNullable<T>;

const _getTeamsInfoQuery = gql`
  query getTeamsInfo {
    locales {
      code
      name
      approvedStrings
      pretranslatedStrings
      stringsWithWarnings
      stringsWithErrors
      missingStrings
      unreviewedStrings
      totalStrings
    }
  }
`;

interface GetTeamsInfoResponse {
  locales: DeepRequired<DeepNonNullable<GetTeamsInfoQuery['locales']>>;
}

const _getProjectsInfoQuery = gql`
  query getProjectsInfo {
    projects {
      slug
      name
    }
  }
`;

export interface GetProjectsInfoResponse {
  projects: DeepRequired<DeepNonNullable<GetProjectsInfoQuery['projects']>>;
}

function getGraphQLClient(pontoonBaseUrl: string) {
  return getSdk(
    new GraphQLClient(pontoonGraphQL(pontoonBaseUrl), {
      method: 'GET',
    }),
  );
}

export const pontoonGraphqlClient = {
  getTeamsInfo: async (): Promise<GetTeamsInfoResponse> => {
    const client = getGraphQLClient(await getPontoonBaseUrl());
    return (await client.getTeamsInfo()) as GetTeamsInfoResponse;
  },
  getProjectsInfo: async (): Promise<GetProjectsInfoResponse> => {
    const client = getGraphQLClient(await getPontoonBaseUrl());
    return (await client.getProjectsInfo()) as GetProjectsInfoResponse;
  },
};

async function getPontoonBaseUrl(): Promise<string> {
  return await getOneOption('pontoon_base_url');
}
