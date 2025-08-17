import React, { useEffect, useState } from 'react';

import type { StorageContent } from '@commons/webExtensionsApi';
import type { OptionsContent } from '@commons/data/defaultOptions';
import {
  getActiveTab,
  getOneFromStorage,
  openNewTab,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonTeamsProject,
} from '@commons/webLinks';
import { getPontoonProjectForTheCurrentTab } from '@commons/backgroundMessaging';
import { doAsync, openNewPontoonTab } from '@commons/utils';
import { ButtonPopupBottomLink } from '@frontend/commons/components/ButtonPopupBottomLink';

async function openNewTabAndClosePopup(url: string): Promise<void> {
  await openNewTab(url);
  window.close();
}

async function openNewPontoonTabAndClosePopup(url: string): Promise<void> {
  await openNewPontoonTab(url);
  window.close();
}

export const ProjectLinks: React.FC = () => {
  const [projectForCurrentTab, setProjectForCurrentTab] =
    useState<StorageContent['projectsList'][string]>();
  const [team, setTeam] = useState<StorageContent['teamsList'][string]>();
  const [pontoonBaseUrl, setPontoonBaseUrl] =
    useState<OptionsContent['pontoon_base_url']>();

  useEffect(() => {
    doAsync(async () => {
      const [
        projectForCurrentTab,
        teamsList,
        { locale_team: teamCode, pontoon_base_url },
      ] = await Promise.all([
        getPontoonProjectForTheCurrentTab(),
        getOneFromStorage('teamsList'),
        getOptions(['locale_team', 'pontoon_base_url']),
      ]);
      setProjectForCurrentTab(projectForCurrentTab);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setTeam(teamsList![teamCode]);
      setPontoonBaseUrl(pontoon_base_url);
    });
  }, []);

  if (projectForCurrentTab && team && pontoonBaseUrl) {
    return (
      <section data-testid="project-links">
        <ButtonPopupBottomLink
          onClick={() =>
            openNewPontoonTabAndClosePopup(
              pontoonTeamsProject(pontoonBaseUrl, team, projectForCurrentTab),
            )
          }
        >
          Open {projectForCurrentTab.name} dashboard for {team.name}
        </ButtonPopupBottomLink>
        <ButtonPopupBottomLink
          onClick={() =>
            openNewPontoonTabAndClosePopup(
              pontoonProjectTranslationView(
                pontoonBaseUrl,
                team,
                projectForCurrentTab,
              ),
            )
          }
        >
          Open {projectForCurrentTab.name} translation view for {team.name}
        </ButtonPopupBottomLink>
        <ButtonPopupBottomLink
          onClick={async () =>
            openNewTabAndClosePopup(
              newLocalizationBug({
                team,
                url: (await getActiveTab()).url,
              }),
            )
          }
        >
          {`Report bug for localization of ${projectForCurrentTab.name} to ${team.name}`}
        </ButtonPopupBottomLink>
      </section>
    );
  } else {
    return <></>;
  }
};
