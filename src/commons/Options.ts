import type { Storage } from 'webextension-polyfill';

import { browser } from './webExtensionsApi';
import {
  defaultOptionsFor,
  BrowserFamily,
  OptionId as DataOptionId,
  OptionValue,
  OptionsValues,
} from './data/defaultOptions';

const PREFIX = 'options.';

export type OptionId = DataOptionId;

/**
 * Encapsulates storing and retrieving user preferences and notifying about their updates.
 */
export class Options {
  private static loadDefaultValues(
    prefix: string,
  ): Record<string, OptionValue> {
    const defaults: Record<string, OptionValue> = {};
    let browserFamily: BrowserFamily;
    if (browser.runtime.getURL('/').startsWith('moz-extension:')) {
      browserFamily = 'mozilla';
    } else {
      browserFamily = 'chromium';
    }
    const loadedDefaults: OptionsValues = {
      ...defaultOptionsFor(browserFamily),
      locale_team: browser.i18n.getUILanguage(),
    };
    Object.entries(loadedDefaults).forEach(
      ([key, value]) => (defaults[`${prefix}${key}`] = value as OptionValue),
    );
    return Object.freeze(defaults);
  }

  private readonly prefix: string;
  private readonly defaultValues: Record<string, OptionValue>;

  constructor() {
    this.prefix = PREFIX;
    this.defaultValues = Options.loadDefaultValues(PREFIX);
  }

  private saveOption(id: string, value: OptionValue | undefined): void {
    browser.storage.local.set({ [id]: value });
  }

  set(id: string, value: OptionValue | undefined): void {
    this.saveOption(`${this.prefix}${id}`, value);
  }

  async get(optionIds: OptionId | OptionId[]): Promise<OptionsValues> {
    let optionIdsArray: OptionId[];
    if (typeof optionIds === 'string') {
      optionIdsArray = [optionIds];
    } else {
      optionIdsArray = optionIds;
    }
    return await browser.storage.local
      .get(optionIdsArray.map((optionId) => `${this.prefix}${optionId}`))
      .then((items) => {
        const optionsWithDefaultValues: OptionsValues = {};
        optionIdsArray.forEach((optionId) => {
          const realOptionId = `${this.prefix}${optionId}`;
          if (items[realOptionId] !== undefined) {
            optionsWithDefaultValues[optionId] = items[realOptionId];
          } else {
            optionsWithDefaultValues[optionId] =
              this.defaultValues[realOptionId];
          }
        });
        return Object.freeze(optionsWithDefaultValues);
      });
  }

  subscribeToOptionChange(
    optionId: string,
    callback: (change: Storage.StorageChange) => void,
  ): void {
    browser.storage.onChanged.addListener((changes, _areaName) => {
      const realOptionId = `${this.prefix}${optionId}`;
      if (changes[realOptionId]) {
        callback(changes[realOptionId]);
      }
    });
  }

  async resetDefaults(): Promise<void> {
    await browser.storage.local.set(this.defaultValues);
  }
}
