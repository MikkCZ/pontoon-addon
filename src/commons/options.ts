import type { Storage } from 'webextension-polyfill';

import { browser, browserFamily } from './webExtensionsApi';
import type { OptionsContent } from './data/defaultOptions';
import { defaultOptionsFor } from './data/defaultOptions';

export type OptionId = keyof OptionsContent;

type OptionValues<ID extends OptionId> = Pick<OptionsContent, ID>;

export type OptionValue<ID extends OptionId> = OptionValues<ID>[ID];

interface OptionChange<ID extends OptionId> extends Storage.StorageChange {
  oldValue?: OptionValue<ID>;
  newValue: OptionValue<ID>;
}

function storageKeyFor(optionId: OptionId): string {
  return `options.${optionId}`;
}

export async function setOption(
  id: OptionId,
  value: OptionValue<OptionId>,
): Promise<void> {
  await browser.storage.local.set({ [storageKeyFor(id)]: value });
}

export async function getOptions<ID extends OptionId>(
  optionIds: ID[],
): Promise<OptionValues<ID>> {
  const defaultValues = defaultOptionsFor(browserFamily());
  const storageItems = await browser.storage.local.get(
    optionIds.map((optionId) => storageKeyFor(optionId)),
  );
  const optionsWithDefaultValues: Partial<OptionValues<ID>> = {};
  for (const optionId of optionIds) {
    const storageKey = storageKeyFor(optionId);
    if (typeof storageItems[storageKey] !== 'undefined') {
      optionsWithDefaultValues[optionId] = storageItems[storageKey];
    } else {
      optionsWithDefaultValues[optionId] = defaultValues[optionId];
    }
  }
  return optionsWithDefaultValues as OptionValues<ID>;
}

export async function getOneOption<ID extends OptionId>(
  optionId: ID,
): Promise<OptionValue<ID>> {
  return ((await getOptions([optionId])) as OptionValues<ID>)[optionId];
}

export function listenToOptionChange<ID extends OptionId>(
  optionId: ID,
  listener: (change: OptionChange<ID>) => void,
) {
  const storageKey = storageKeyFor(optionId);
  return browser.storage.onChanged.addListener((changes, _areaName) => {
    if (changes[storageKey]) {
      listener(changes[storageKey] as OptionChange<ID>);
    }
  });
}

export async function resetDefaultOptions(): Promise<void> {
  const defaultValues = defaultOptionsFor(browserFamily());
  const storageContent: { [K in string]: OptionValue<OptionId> } = {};
  Object.entries(defaultValues).forEach(([id, value]) => {
    storageContent[storageKeyFor(id as OptionId)] =
      value as OptionValue<OptionId>;
  });
  await browser.storage.local.set(storageContent);
}
