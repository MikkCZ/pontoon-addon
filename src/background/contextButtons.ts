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
import { openNewPontoonTab } from '@commons/utils';

import { BackgroundClientMessageType } from './BackgroundClientMessageType';

export function setupPageContextButtons() {
  listenToMessagesFromContentScript();
}

function listenToMessagesFromContentScript() {
  listenToMessages(
    BackgroundClientMessageType.SEARCH_TEXT_IN_PONTOON,
    async (message: { text: string }) => {
      const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
        await getOptions(['pontoon_base_url', 'locale_team']);
      openNewPontoonTab(
        pontoonProjectTranslationView(
          pontoonBaseUrl,
          { code: teamCode },
          { slug: 'all-projects' },
          message.text,
        ),
      );
    },
  );
  listenToMessages(
    BackgroundClientMessageType.REPORT_TRANSLATED_TEXT_TO_BUGZILLA,
    async (message: { text: string }, { url }) => {
      const [teamCode, teamsList] = await Promise.all([
        getOneOption('locale_team'),
        getOneFromStorage('teamsList'),
      ]);
      openNewTab(
        newLocalizationBug({
          team: teamsList![teamCode], // eslint-disable-line @typescript-eslint/no-non-null-assertion
          selectedText: message.text,
          url,
        }),
      );
    },
  );
}
