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

export function setupPageContextButtons() {
  listenToMessagesFromContentScript();
}

function listenToMessagesFromContentScript() {
  listenToMessages<'SEARCH_TEXT_IN_PONTOON'>(
    'search-text-in-pontoon',
    async ({ text }) => {
      const { pontoon_base_url: pontoonBaseUrl, locale_team: teamCode } =
        await getOptions(['pontoon_base_url', 'locale_team']);
      openNewPontoonTab(
        pontoonProjectTranslationView(
          pontoonBaseUrl,
          { code: teamCode },
          { slug: 'all-projects' },
          text,
        ),
      );
    },
  );
  listenToMessages<'REPORT_TRANSLATED_TEXT_TO_BUGZILLA'>(
    'report-translated-text-to-bugzilla',
    async ({ text: selectedText }, { url }) => {
      const [teamCode, teamsList] = await Promise.all([
        getOneOption('locale_team'),
        getOneFromStorage('teamsList'),
      ]);
      openNewTab(
        newLocalizationBug({
          team: teamsList![teamCode], // eslint-disable-line @typescript-eslint/no-non-null-assertion
          selectedText,
          url,
        }),
      );
    },
  );
}
