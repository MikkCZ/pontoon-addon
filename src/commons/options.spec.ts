/* eslint-disable jest/expect-expect */
import 'mockzilla-webextension';

import {
  getOneOption,
  getOptions,
  resetDefaultOptions,
  setOption,
} from './options';
import { defaultOptionsFor } from './data/defaultOptions';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/data/defaultOptions');

(defaultOptionsFor as jest.Mock).mockImplementation(() => ({
  locale_team: 'en',
}));

beforeEach(() => {
  mockBrowser.runtime.getURL.mock(() => 'moz-extension://');
});

describe('options', () => {
  it('setOption', async () => {
    mockBrowser.storage.local.set
      .expect({ 'options.locale_team': 'cs' })
      .andResolve();

    await setOption('locale_team', 'cs');
  });

  it('getOptions', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({ 'options.locale_team': 'cs' });

    const { locale_team } = await getOptions(['locale_team']);

    expect(locale_team).toBe('cs');
  });

  it('getOptions loads default', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({});

    const { locale_team } = await getOptions(['locale_team']);

    expect(locale_team).toBe('en');
  });

  it('getOneOption', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({ 'options.locale_team': 'cs' });

    const locale_team = await getOneOption('locale_team');

    expect(locale_team).toBe('cs');
  });

  it('getOneOption loads default', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({});

    const locale_team = await getOneOption('locale_team');

    expect(locale_team).toBe('en');
  });

  it('resetDefaultOptions', async () => {
    mockBrowser.storage.local.set
      .expect(expect.objectContaining({ 'options.locale_team': 'en' }))
      .andResolve();

    await resetDefaultOptions();
  });
});
