import type { WebRequest } from 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

import type { Options } from '@commons/Options';
import { browser } from '@commons/webExtensionsApi';

import type { RemotePontoon } from './RemotePontoon';

export class DataFetcher {
  private readonly options: Options;
  private readonly remotePontoon: RemotePontoon;
  private readonly pontoonRequestTokens: Set<string>;
  private readonly pontoonRequestsListener: (
    details: WebRequest.OnBeforeSendHeadersDetailsType
  ) => WebRequest.BlockingResponseOrPromise;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this.options = options;
    this.remotePontoon = remotePontoon;
    this.pontoonRequestTokens = new Set();
    this.pontoonRequestsListener = (details) =>
      this.updatePontoonRequest(details);

    const requiredPermissions = ['cookies', 'webRequest', 'webRequestBlocking'];
    browser.permissions
      .contains({ permissions: requiredPermissions })
      .then((hasPermissions) => {
        if (hasPermissions) {
          this.watchOptionsUpdates();
          this.watchPontoonRequests();
        }
      });
  }

  private watchOptionsUpdates() {
    this.remotePontoon.subscribeToBaseUrlChange(() =>
      this.watchPontoonRequests()
    );
  }

  private watchPontoonRequests() {
    browser.webRequest.onBeforeSendHeaders.removeListener(
      this.pontoonRequestsListener
    );
    browser.webRequest.onBeforeSendHeaders.addListener(
      this.pontoonRequestsListener,
      { urls: [`${this.remotePontoon.getBaseUrl()}/*`] },
      ['blocking', 'requestHeaders']
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
        this.pontoonRequestsListener
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
    details: WebRequest.OnBeforeSendHeadersDetailsType
  ): WebRequest.BlockingResponseOrPromise {
    const tokenHeaders =
      details.requestHeaders?.filter(
        (header) => header.name === 'pontoon-addon-token'
      ) || [];
    details.requestHeaders = details.requestHeaders?.filter(
      (header) => header.name !== 'pontoon-addon-token'
    );
    const isMarked =
      tokenHeaders.length > 0 &&
      tokenHeaders.every((header) => this.verifyToken(header?.value));
    if (isMarked) {
      return this.options
        .get('contextual_identity')
        .then((item: any) => {
          return browser.cookies.get({
            url: this.remotePontoon.getBaseUrl(),
            name: 'sessionid',
            storeId: item['contextual_identity'],
          });
        })
        .then((cookie) => {
          const finalHeaders = details.requestHeaders
            ?.filter((header) => header.name !== 'pontoon-addon-token')
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
