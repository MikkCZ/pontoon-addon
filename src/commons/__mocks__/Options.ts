import type { Storage } from 'webextension-polyfill';

import type { OptionId, OptionValue } from '../Options';

export class Options {
  set: (id: string, value: OptionValue | undefined) => void;
  get: (id: OptionId | OptionId[]) => Promise<OptionValue>;
  subscribeToOptionChange: (
    optionId: string,
    callback: (change: Storage.StorageChange) => void,
  ) => void;
  resetDefaults: () => Promise<void>;

  constructor() {
    this.set = jest.fn();
    this.get = jest.fn();
    this.subscribeToOptionChange = jest.fn();
    this.resetDefaults = jest.fn();
  }
}
