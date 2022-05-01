import type { WebRequest } from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

import { browser, hasPermissions } from '@commons/webExtensionsApi';
import {
  getOneOption,
  getOptions,
  listenToOptionChange,
} from '@commons/options';

export class DataFetcher {
  private readonly pontoonRequestTokens: Set<string>;
  private readonly pontoonRequestsListener: (
    details: WebRequest.OnBeforeSendHeadersDetailsType,
  ) => WebRequest.BlockingResponseOrPromise;

  constructor() {
    this.pontoonRequestTokens = new Set();
    this.pontoonRequestsListener = (details) => {
      return this.updatePontoonRequest(details);
    };

    hasPermissions('cookies', 'webRequest', 'webRequestBlocking').then(
      async (hasRequiredPermissions) => {
        if (hasRequiredPermissions) {
          listenToOptionChange(
            'pontoon_base_url',
            ({ newValue: pontoonBaseUrl }) => {
              this.watchPontoonRequests(pontoonBaseUrl);
            },
          );
          const pontoonBaseUrl = await getOneOption('pontoon_base_url');
          this.watchPontoonRequests(pontoonBaseUrl);
        }
      },
    );
  }

  private watchPontoonRequests(pontoonBaseUrl: string) {
    browser.webRequest.onBeforeSendHeaders.removeListener(
      this.pontoonRequestsListener,
    );
    browser.webRequest.onBeforeSendHeaders.addListener(
      this.pontoonRequestsListener,
      { urls: [`${pontoonBaseUrl}/*`] },
      ['blocking', 'requestHeaders'],
    );
  }

  public fetch(url: string): Promise<Response> {
    return fetch(url, { credentials: 'omit' });
  }

  public fetchFromPontoonSession(url: string): Promise<Response> {
    const headers = new Headers();
    headers.append('X-Requested-With', 'XMLHttpRequest');
    if (
      browser.webRequest &&
      browser.webRequest.onBeforeSendHeaders.hasListener(
        this.pontoonRequestsListener,
      )
    ) {
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

  private updatePontoonRequest(
    details: WebRequest.OnBeforeSendHeadersDetailsType,
  ): WebRequest.BlockingResponseOrPromise {
    const tokenHeaders =
      details.requestHeaders?.filter(
        (header) => header.name === 'pontoon-addon-token',
      ) ?? [];
    details.requestHeaders = details.requestHeaders?.filter(
      (header) => header.name !== 'pontoon-addon-token',
    );
    const isMarked =
      tokenHeaders.length > 0 &&
      tokenHeaders.every((header) => this.verifyToken(header?.value));
    if (isMarked) {
      return getOptions(['contextual_identity', 'pontoon_base_url'])
        .then(
          ({
            contextual_identity: contextualIdentity,
            pontoon_base_url: pontoonBaseUrl,
          }) => {
            return browser.cookies.get({
              url: pontoonBaseUrl,
              name: 'sessionid',
              storeId: contextualIdentity,
            });
          },
        )
        .then((cookie) => {
          const finalHeaders = (details.requestHeaders ?? [])
            .filter((header) => header.name.toLowerCase() !== 'cookie')
            .concat({
              name: 'Cookie',
              value: `${cookie.name}=${cookie.value}`,
            });
          return { requestHeaders: finalHeaders };
        });
    } else {
      return details;
    }
  }
}
