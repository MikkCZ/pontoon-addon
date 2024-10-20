/* eslint-disable jest/expect-expect */
import {
  getOneOption,
  getOptions,
  resetDefaultOptions,
  setOption,
} from './options';
import { defaultOptionsFor } from './data/defaultOptions';

jest.mock('@commons/data/defaultOptions');

(defaultOptionsFor as jest.Mock).mockReturnValue({ locale_team: 'en' });

beforeEach(() => {
  (browser.runtime.getURL as jest.Mock).mockReturnValue('moz-extension://');
});

describe('options', () => {
  it('setOption', async () => {
    (browser.storage.local.set as jest.Mock).mockResolvedValueOnce(undefined);

    await setOption('locale_team', 'cs');

    expect(browser.storage.local.set).toHaveBeenCalledWith({
      'options.locale_team': 'cs',
    });
  });

  it('getOptions', async () => {
    (browser.storage.local.get as jest.Mock).mockResolvedValueOnce({
      'options.locale_team': 'cs',
    });

    const { locale_team } = await getOptions(['locale_team']);

    expect(locale_team).toBe('cs');
    expect(browser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
  });

  it('getOptions loads default', async () => {
    (browser.storage.local.get as jest.Mock).mockResolvedValueOnce({});

    const { locale_team } = await getOptions(['locale_team']);

    expect(locale_team).toBe('en');
    expect(browser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
  });

  it('getOneOption', async () => {
    (browser.storage.local.get as jest.Mock).mockResolvedValueOnce({
      'options.locale_team': 'cs',
    });

    const locale_team = await getOneOption('locale_team');

    expect(locale_team).toBe('cs');
    expect(browser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
  });

  it('getOneOption loads default', async () => {
    (browser.storage.local.get as jest.Mock).mockResolvedValueOnce({});

    const locale_team = await getOneOption('locale_team');

    expect(locale_team).toBe('en');
    expect(browser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
  });

  it('resetDefaultOptions', async () => {
    (browser.storage.local.set as jest.Mock).mockResolvedValueOnce(undefined);

    await resetDefaultOptions();

    expect(browser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'options.locale_team': 'en' }),
    );
  });
});
