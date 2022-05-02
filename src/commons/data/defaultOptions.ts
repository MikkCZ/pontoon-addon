import { DEFAULT_PONTOON_BASE_URL } from '../../const';
import { browser, BrowserFamily } from '../webExtensionsApi';

export interface OptionsContent {
  locale_team: string;
  data_update_interval: number;
  display_toolbar_button_badge: boolean;
  toolbar_button_action: 'popup' | 'team-page' | 'home-page';
  toolbar_button_popup_always_hide_read_notifications: boolean;
  show_notifications: boolean;
  contextual_identity: string;
  pontoon_base_url: string;
}

const generalDefaultOptions: Omit<OptionsContent, 'contextual_identity'> = {
  locale_team: browser.i18n.getUILanguage(),
  pontoon_base_url: DEFAULT_PONTOON_BASE_URL,
  data_update_interval: 15,
  display_toolbar_button_badge: true,
  toolbar_button_action: 'popup',
  toolbar_button_popup_always_hide_read_notifications: false,
  show_notifications: true,
};

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
