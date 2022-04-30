import { DEFAULT_PONTOON_BASE_URL } from '../../const';
import { BrowserFamily } from '../webExtensionsApi';

export type OptionId =
  | 'locale_team'
  | 'data_update_interval'
  | 'display_toolbar_button_badge'
  | 'toolbar_button_action'
  | 'toolbar_button_popup_always_hide_read_notifications'
  | 'show_notifications'
  | 'contextual_identity'
  | 'pontoon_base_url';

export type OptionValue = boolean | number | string;

export type OptionsValues = {
  [optionId in OptionId]?: OptionValue;
};

const generalDefaultOptions: OptionsValues = {
  pontoon_base_url: DEFAULT_PONTOON_BASE_URL,
  data_update_interval: 15,
  display_toolbar_button_badge: true,
  toolbar_button_action: 'popup',
  toolbar_button_popup_always_hide_read_notifications: false,
  show_notifications: true,
};

const defaultOptionsForFirefox: OptionsValues = {
  contextual_identity: 'firefox-default',
};

const defaultOptionsForChromium: OptionsValues = {
  contextual_identity: '0',
};

export function defaultOptionsFor(browserFamily: BrowserFamily): OptionsValues {
  switch (browserFamily) {
    case BrowserFamily.MOZILLA:
      return {
        ...generalDefaultOptions,
        ...defaultOptionsForFirefox,
      };
    case BrowserFamily.CHROMIUM:
      return {
        ...generalDefaultOptions,
        ...defaultOptionsForChromium,
      };
    default:
      return {
        ...generalDefaultOptions,
      };
  }
}
