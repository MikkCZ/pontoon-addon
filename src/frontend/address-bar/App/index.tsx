import React, { useEffect, useState } from 'react';

import type { OptionsContent } from '@commons/data/defaultOptions';
import {
  getActiveTab,
  getOneFromStorage,
  openNewTab,
  StorageContent,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonTeamsProject,
} from '@commons/webLinks';
import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';

import { PanelSection } from '../PanelSection';

export const App: React.FC = () => {
  const [project, setProject] = useState<
    StorageContent['projectsList'][string] | undefined
  >();
  const [team, setTeam] = useState<
    StorageContent['teamsList'][string] | undefined
  >();
  const [pontoonBaseUrl, setPontoonBaseUrl] = useState<
    OptionsContent['pontoon_base_url'] | undefined
  >();

  useEffect(() => {
    (async () => {
      const [
        projectForCurrentTab,
        teamsList,
        { locale_team: teamCode, pontoon_base_url },
      ] = await Promise.all([
        getPontoonProjectForTheCurrentTab(),
        getOneFromStorage('teamsList'),
        getOptions(['locale_team', 'pontoon_base_url']),
      ]);
      setProject(projectForCurrentTab);
      setTeam(teamsList![teamCode]);
      setPontoonBaseUrl(pontoon_base_url);
    })();
  }, []);

  return project && team && pontoonBaseUrl ? (
    <PanelSection
      items={[
        {
          text: `Open ${project.name} dashboard for ${team.name}`,
          onClick: () =>
            openNewTab(pontoonTeamsProject(pontoonBaseUrl, team, project)),
        },
        {
          text: `Open ${project.name} translation view for ${team.name}`,
          onClick: () =>
            openNewTab(
              pontoonProjectTranslationView(pontoonBaseUrl, team, project),
            ),
        },
        {
          text: `Report bug for localization of ${project.name} to ${team.name}`,
          onClick: async () =>
            openNewTab(
              newLocalizationBug({
                team,
                url: (await getActiveTab()).url!,
              }),
            ),
        },
      ]}
    />
  ) : (
    <></>
  );
};
