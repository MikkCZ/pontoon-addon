import type { WebRequest } from 'webextension-polyfill-ts';
import { v4 as uuidv4 } from 'uuid';

import type { Options } from '@pontoon-addon/commons/src/Options';

import { browser } from './util/webExtensionsApi';
import type { RemotePontoon } from './RemotePontoon';

export class DataFetcher {
  private readonly _options: Options;
  private readonly _remotePontoon: RemotePontoon;
  private readonly _pontoonRequestTokens: Set<string>;
  private readonly _pontoonRequestsListener: (
    details: WebRequest.OnBeforeSendHeadersDetailsType
  ) => WebRequest.BlockingResponseOrPromise;

  constructor(options: Options, remotePontoon: RemotePontoon) {
    this._options = options;
    this._remotePontoon = remotePontoon;
    this._pontoonRequestTokens = new Set();
    this._pontoonRequestsListener = (details) =>
      this._updatePontoonRequest(details);

    const requiredPermissions = ['cookies', 'webRequest', 'webRequestBlocking'];
    browser.permissions
      .contains({ permissions: requiredPermissions })
      .then((hasPermissions) => {
        if (hasPermissions) {
          this._watchOptionsUpdates();
          this._watchPontoonRequests();
        }
      });
  }

  private _watchOptionsUpdates() {
    this._remotePontoon.subscribeToBaseUrlChange(() =>
      this._watchPontoonRequests()
    );
  }

  private _watchPontoonRequests() {
    browser.webRequest.onBeforeSendHeaders.removeListener(
      this._pontoonRequestsListener
    );
    browser.webRequest.onBeforeSendHeaders.addListener(
      this._pontoonRequestsListener,
      { urls: [this._remotePontoon.getBaseUrl() + '/*'] },
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
        this._pontoonRequestsListener
      )
    ) {
      headers.append('pontoon-addon-token', this._issueNewToken());
      return fetch(url, { credentials: 'omit', headers: headers });
    } else {
      return fetch(url, { credentials: 'include', headers: headers });
    }
  }

  private _issueNewToken(): string {
    const token = uuidv4();
    this._pontoonRequestTokens.add(token);
    return token;
  }

  private _verifyToken(token: string | undefined): boolean {
    if (token) {
      const valid = this._pontoonRequestTokens.has(token);
      this._pontoonRequestTokens.delete(token);
      return valid;
    } else {
      return false;
    }
  }

  private _updatePontoonRequest(
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
      tokenHeaders.every((header) => this._verifyToken(header?.value));
    if (isMarked) {
      return this._options
        .get('contextual_identity')
        .then((item: any) => {
          return browser.cookies.get({
            url: this._remotePontoon.getBaseUrl(),
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
