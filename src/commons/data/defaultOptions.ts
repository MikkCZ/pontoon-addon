import { DEFAULT_PONTOON_BASE_URL } from '../../const';
import { browser, BrowserFamily } from '../webExtensionsApi';

export interface OptionsContent {
  locale_team: string;
  data_update_interval: number;
  toolbar_button_action: 'popup' | 'team-page';
  toolbar_button_popup_always_hide_read_notifications: boolean;
  show_notifications: boolean;
  contextual_identity: string;
  pontoon_base_url: string;
}

const generalDefaultOptions: Omit<OptionsContent, 'contextual_identity'> = {
  locale_team: browser.i18n.getUILanguage(),
  pontoon_base_url: DEFAULT_PONTOON_BASE_URL,
  data_update_interval: 15,
  toolbar_button_action: 'popup',
  toolbar_button_popup_always_hide_read_notifications: false,
  show_notifications: true,
};

export function coalesceLegacyValues<K extends keyof OptionsContent>(
  id: K,
  value: OptionsContent[K],
): OptionsContent[K] {
  if (id === 'toolbar_button_action' && value === 'home-page') {
    return 'team-page' as OptionsContent[K];
  } else {
    return value;
  }
}

export function defaultOptionsFor(
  browserFamily: BrowserFamily,
): OptionsContent {
  switch (browserFamily) {
    case BrowserFamily.MOZILLA:
      return {
        ...generalDefaultOptions,
        contextual_identity: 'firefox-default',
      };
    case BrowserFamily.CHROMIUM:
      return {
        ...generalDefaultOptions,
        contextual_identity: '0',
      };
    default:
      return {
        ...generalDefaultOptions,
        contextual_identity: '',
      };
  }
}
