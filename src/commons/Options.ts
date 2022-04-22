import type { Storage } from 'webextension-polyfill';

import { browser } from './webExtensionsApi';

type OptionId =
  | 'locale_team'
  | 'data_update_interval'
  | 'display_toolbar_button_badge'
  | 'toolbar_button_action'
  | 'toolbar_button_popup_always_hide_read_notifications'
  | 'show_notifications'
  | 'contextual_identity'
  | 'pontoon_base_url';

type OptionValue = boolean | number | string;

type OptionsValues = {
  [optionId in OptionId]?: OptionValue;
};

/**
 * Encapsulates storing and retrieving user preferences and notifying about their updates.
 */
export class Options {
  static async create(): Promise<Options> {
    const prefix = 'options.';
    const defaults = await Options.loadDefaultValues(prefix);
    return new Options(prefix, defaults);
  }

  private readonly prefix: string;
  private readonly prefixRegExp: RegExp;
  private readonly defaultValues: Record<string, OptionValue>;

  constructor(prefix: string, defaultValues: Record<string, OptionValue>) {
    this.prefix = prefix;
    this.prefixRegExp = new RegExp(`^${this.prefix}`);
    this.defaultValues = defaultValues;
  }

  private static async loadDefaultValues(
    prefix: string,
  ): Promise<Record<string, OptionValue>> {
    const defaults: Record<string, OptionValue> = {};
    let browserFamily = '';
    if (browser.runtime.getURL('/').startsWith('moz-extension:')) {
      browserFamily = 'mozilla';
    } else {
      browserFamily = 'chromium';
    }
    await Promise.all([
      fetch(browser.runtime.getURL('assets/data/default-options.json')).then(
        (response) => response.json(),
      ),
      fetch(
        browser.runtime.getURL(
          `assets/data/default-options-${browserFamily}.json`,
        ),
      ).then((response) => response.json()),
      Promise.resolve({ locale_team: browser.i18n.getUILanguage() }),
    ]).then(
      ([
        defaultOptionsFromJSON,
        defaultOptionsForBrowser,
        defaultOptionsFromRuntime,
      ]) => {
        const loadedDefaults = Object.assign(
          {},
          defaultOptionsFromJSON,
          defaultOptionsForBrowser,
          defaultOptionsFromRuntime,
        );
        Object.entries(loadedDefaults).forEach(
          ([key, value]) =>
            (defaults[`${prefix}${key}`] = value as OptionValue),
        );
      },
    );
    return Object.freeze(defaults);
  }

  private getOptionId(input: HTMLInputElement | HTMLSelectElement): string {
    return `${this.prefix}${input.dataset.optionId}`;
  }

  private getInputId(optionId: string): string {
    return optionId.replace(this.prefixRegExp, '');
  }

  private static isValidInput(
    input: HTMLInputElement | HTMLSelectElement | HTMLElement,
  ): boolean {
    return (
      input.nodeName.toLowerCase() === 'select' ||
      (input instanceof HTMLInputElement && input.type === 'radio') ||
      input.parentElement?.querySelector(':valid') === input
    );
  }

  private static getValueFromInput(
    input: HTMLInputElement | HTMLSelectElement,
  ): OptionValue {
    if (input instanceof HTMLInputElement && input.type === 'checkbox') {
      return input.checked;
    } else {
      return input.value;
    }
  }

  private saveOption(id: string, value: OptionValue): void {
    const option: Record<string, OptionValue> = {};
    option[id] = value;
    browser.storage.local.set(option);
  }

  set(id: string, value: OptionValue): void {
    this.saveOption(`${this.prefix}${id}`, value);
  }

  updateOptionFromInput(input: HTMLInputElement | HTMLSelectElement): void {
    if (Options.isValidInput(input)) {
      const optionId = this.getOptionId(input);
      const value = Options.getValueFromInput(input);
      this.saveOption(optionId, value);
    }
  }

  private static setValueToInputs(
    inputs: (HTMLInputElement | HTMLSelectElement)[],
    value: OptionValue,
  ): void {
    if (inputs.length === 1) {
      const input = inputs[0];
      if (
        input instanceof HTMLInputElement &&
        (input.type === 'checkbox' || input.type === 'radio')
      ) {
        input.checked = value as boolean;
      } else {
        input.value = `${value}`;
      }
    } else if (
      inputs.length > 1 &&
      [...inputs].every((input) => input.type === 'radio')
    ) {
      const input = [...inputs].filter((input) => input.value === value);
      if (input.length === 1) {
        Options.setValueToInputs(input, true);
      } else {
        console.error(
          `The options inputs do not correspond with the stored value ${value}.`,
          inputs,
        );
      }
    } else {
      console.error('The options inputs have wrong structure.', inputs);
    }
  }

  private loadAllFromObject(object: Record<string, OptionValue>): void {
    Object.entries(object)
      .filter(([key, _value]) => key.startsWith(this.prefix))
      .forEach(([key, value]) => {
        const inputs = Array.from(
          document.querySelectorAll(`[data-option-id=${this.getInputId(key)}]`),
        ) as (HTMLInputElement | HTMLSelectElement)[];
        if (inputs.length > 0) {
          Options.setValueToInputs(inputs, value);
        }
      });
  }

  async loadAllFromLocalStorage(): Promise<void> {
    this.loadAllFromObject(this.defaultValues);
    await browser.storage.local
      .get()
      .then((items) => this.loadAllFromObject(items));
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
