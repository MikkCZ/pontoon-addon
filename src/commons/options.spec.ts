/* eslint-disable jest/expect-expect */
import { mockBrowser, mockBrowserNode } from './test/mockWebExtensionsApi';
import {
  getOneOption,
  getOptions,
  resetDefaultOptions,
  setOption,
} from './options';
import { browserFamily } from './webExtensionsApi';

jest.mock('./webExtensionsApi');
jest.mock('./data/defaultOptions', () => ({
  defaultOptionsFor: () => ({
    locale_team: 'en',
  }),
}));

beforeEach(() => {
  (browserFamily as jest.Mock).mockReturnValue('mozilla');
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('options', () => {
  it('setOption', async () => {
    mockBrowser.storage.local.set
      .expect({ 'options.locale_team': 'cs' })
      .andResolve();

    await setOption('locale_team', 'cs');

    mockBrowserNode.verify();
  });

  it('getOptions', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({ 'options.locale_team': 'cs' });

    const { locale_team } = await getOptions(['locale_team']);

    expect(locale_team).toBe('cs');
    mockBrowserNode.verify();
  });

  it('getOptions loads default', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({});

    const { locale_team } = await getOptions(['locale_team']);

    expect(locale_team).toBe('en');
    mockBrowserNode.verify();
  });

  it('getOneOption', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({ 'options.locale_team': 'cs' });

    const locale_team = await getOneOption('locale_team');

    expect(locale_team).toBe('cs');
    mockBrowserNode.verify();
  });

  it('getOneOption loads default', async () => {
    mockBrowser.storage.local.get
      .expect(['options.locale_team'])
      .andResolve({});

    const locale_team = await getOneOption('locale_team');

    expect(locale_team).toBe('en');
    mockBrowserNode.verify();
  });

  it('resetDefaultOptions', async () => {
    mockBrowser.storage.local.set
      .expect(expect.objectContaining({ 'options.locale_team': 'en' }))
      .andResolve();

    await resetDefaultOptions();

    mockBrowserNode.verify();
  });
});
