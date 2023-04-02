import type { WebRequest } from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';
import gql from 'graphql-tag';
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

class PontoonHttpClient {
  private readonly pontoonRequestTokens: Set<string>;
  private readonly requestsToPontoonListener: (
    details: WebRequest.OnBeforeSendHeadersDetailsType,
  ) => WebRequest.BlockingResponseOrPromise;

  constructor() {
    this.pontoonRequestTokens = new Set();
    this.requestsToPontoonListener = (details) => {
      return this.setSessionCookieForPontoonRequest(details);
    };

    listenToOptionChange('pontoon_base_url', ({ newValue: pontoonBaseUrl }) => {
      this.listenForRequestsToPontoon(pontoonBaseUrl);
    });
    this.listenForRequestsToPontoon();
  }

  private async listenForRequestsToPontoon(pontoonBaseUrl?: string) {
    if (browser.webRequest) {
      if (typeof pontoonBaseUrl === 'undefined') {
        pontoonBaseUrl = await getOneOption('pontoon_base_url');
      }
      browser.webRequest.onBeforeSendHeaders.removeListener(
        this.requestsToPontoonListener,
      );
      browser.webRequest.onBeforeSendHeaders.addListener(
        this.requestsToPontoonListener,
        { urls: [`${pontoonBaseUrl}/*`] },
        ['blocking', 'requestHeaders'],
      );
    }
  }

  public async fetchFromPontoonSession(url: string): Promise<Response> {
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
        this.requestsToPontoonListener,
      ) || (await this.listenForRequestsToPontoon());
      headers.append('pontoon-addon-token', this.issueNewToken());
      return fetch(url, { credentials: 'omit', headers: headers });
    } else {
      return fetch(url, { credentials: 'include', headers: headers });
    }
  }

  private issueNewToken(): string {
    const token = uuidv4();
    this.pontoonRequestTokens.add(token);
    return token;
  }

  private verifyToken(token: string | undefined): boolean {
    if (token) {
      const valid = this.pontoonRequestTokens.has(token);
      this.pontoonRequestTokens.delete(token);
      return valid;
    } else {
      return false;
    }
  }

  private async setSessionCookieForPontoonRequest(
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
      tokens.length > 0 && tokens.every((token) => this.verifyToken(token));

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
}

export const pontoonHttpClient = new PontoonHttpClient();

export const httpClient = {
  fetch: async (url: string): Promise<Response> => {
    return fetch(url, { credentials: 'omit' });
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

export function graphqlClient(pontoonBaseUrl: string) {
  const client = getSdk(
    new GraphQLClient(pontoonGraphQL(pontoonBaseUrl), {
      method: 'GET',
    }),
  );
  return {
    getTeamsInfo: client.getTeamsInfo as () => Promise<GetTeamsInfoResponse>,
    getProjectsInfo:
      client.getProjectsInfo as () => Promise<GetProjectsInfoResponse>,
  };
}
