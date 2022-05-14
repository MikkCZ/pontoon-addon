import {
  pontoonProjectTranslationView,
  newLocalizationBug,
} from '@commons/webLinks';
import {
  listenToMessages,
  openNewTab,
  getOneFromStorage,
} from '@commons/webExtensionsApi';
import { getOneOption, getOptions } from '@commons/options';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';

export function setupPageContextButtons() {
  listenToMessagesFromContentScript();
}

function listenToMessagesFromContentScript() {
  listenToMessages(
    BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
    async (message: { text?: string }) => {
      const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
        await getOptions(['pontoon_base_url', 'locale_team']);
      openNewTab(
        pontoonProjectTranslationView(
          pontoonBaseUrl,
          { code: teamCode },
          { slug: 'all-projects' },
          message.text!,
        ),
      );
    },
  );
  listenToMessages(
    BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA,
    async (message: { text?: string }, { url: fromUrl }) => {
      const [teamCode, teamsList] = await Promise.all([
        getOneOption('locale_team'),
        getOneFromStorage('teamsList'),
      ]);
      const team = teamsList![teamCode];
      openNewTab(
        newLocalizationBug({
          team,
          selectedText: message.text!,
          url: fromUrl!,
        }),
      );
    },
  );
}
