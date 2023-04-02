import type { CSSProperties } from 'react';
import React, { useState, useEffect } from 'react';
import ReactTimeAgo from 'react-time-ago';
import styled from 'styled-components';

import type { StorageContent } from '@commons/webExtensionsApi';
import {
  getActiveTab,
  getFromStorage,
  openNewTab,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonSearchStringsWithStatus,
  pontoonTeam,
  pontoonTeamsProject,
} from '@commons/webLinks';
import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';
import lightbulbImage from '@assets/img/lightbulb-blue.svg';
import { openNewPontoonTab } from '@commons/utils';

import { BottomLink } from '../BottomLink';
import { TeamInfoListItem } from '../TeamInfoListItem';

const Title = styled.h1`
  margin: 0 0.5em;
  padding: 0;
`;

const TitleLink = styled.button.attrs({ className: 'link' })`
  && {
    display: inline-block;
    width: 100%;
    color: #ebebeb;

    &:hover {
      color: #7bc876;
    }
  }
`;

const List = styled.ul`
  margin: 0 0.5em;
  list-style-type: none;
  padding: 0.5em 1em 0.5em 0.5em;
  color: #aaa;
  border-bottom: 1px solid #525a65;
`;

export const Name = styled.span`
  font-weight: bold;
  color: #ebebeb;
`;

export const Code = styled.span`
  font-weight: normal;
  color: #7bc876;
`;

const STRING_CATEGORIES: Array<{
  status: string;
  label: string;
  dataProperty: keyof StorageContent['teamsList'][string]['strings'];
  labelBeforeStyle?: CSSProperties;
}> = [
  {
    status: 'translated',
    label: 'translated',
    dataProperty: 'approvedStrings',
    labelBeforeStyle: { backgroundColor: '#7bc876' },
  },
  {
    status: 'pretranslated',
    label: 'pretranslated',
    dataProperty: 'pretranslatedStrings',
    labelBeforeStyle: { backgroundColor: '#c0ff00' },
  },
  {
    status: 'warnings',
    label: 'warnings',
    dataProperty: 'stringsWithWarnings',
    labelBeforeStyle: { backgroundColor: '#ffa10f' },
  },
  {
    status: 'errors',
    label: 'errors',
    dataProperty: 'stringsWithErrors',
    labelBeforeStyle: { backgroundColor: '#f36' },
  },
  {
    status: 'missing',
    label: 'missing',
    dataProperty: 'missingStrings',
    labelBeforeStyle: { backgroundColor: '#4d5967' },
  },
  {
    status: 'unreviewed',
    label: 'unreviewed',
    dataProperty: 'unreviewedStrings',
    labelBeforeStyle: {
      height: '1em',
      background: `center / contain no-repeat url(${lightbulbImage})`,
    },
  },
  { status: 'all', label: 'all strings', dataProperty: 'totalStrings' },
];

async function openNewTabAndClosePopup(url: string): Promise<void> {
  await openNewTab(url);
  window.close();
}

async function openNewPontoonTabAndClosePopup(url: string): Promise<void> {
  await openNewPontoonTab(url);
  window.close();
}

export const TeamInfo: React.FC = () => {
  const [projectForCurrentTab, setProjectForCurrentTab] =
    useState<StorageContent['projectsList'][string]>();
  const [team, setTeam] = useState<StorageContent['teamsList'][string]>();
  const [teamActivity, setTeamActivity] =
    useState<StorageContent['latestTeamsActivity'][string]>();
  const [pontoonBaseUrl, setPontoonBaseUrl] =
    useState<OptionsContent['pontoon_base_url']>();

  useEffect(() => {
    (async () => {
      const [
        projectForCurrentTab,
        { teamsList, latestTeamsActivity },
        { locale_team: teamCode, pontoon_base_url },
      ] = await Promise.all([
        getPontoonProjectForTheCurrentTab(),
        getFromStorage(['teamsList', 'latestTeamsActivity']),
        getOptions(['locale_team', 'pontoon_base_url']),
      ]);
      setProjectForCurrentTab(projectForCurrentTab);
      setTeam(teamsList![teamCode]);
      setTeamActivity(latestTeamsActivity![teamCode]);
      setPontoonBaseUrl(pontoon_base_url);
    })();
  }, []);

  return team && pontoonBaseUrl ? (
    <section>
      <Title>
        <TitleLink
          onClick={() =>
            openNewPontoonTabAndClosePopup(pontoonTeam(pontoonBaseUrl, team))
          }
        >
          <Name>{team.name}</Name> <Code>{team.code}</Code>
        </TitleLink>
      </Title>
      <List>
        {teamActivity && (
          <TeamInfoListItem
            key="activity"
            label="Activity"
            value={
              teamActivity.date_iso &&
              !isNaN(Date.parse(teamActivity.date_iso)) ? (
                <>
                  {teamActivity.user}{' '}
                  <ReactTimeAgo date={new Date(teamActivity.date_iso)} />
                </>
              ) : (
                '―'
              )
            }
          />
        )}
        {STRING_CATEGORIES.map((category) => (
          <TeamInfoListItem
            key={category.status}
            squareStyle={category.labelBeforeStyle}
            label={category.label}
            value={team.strings[category.dataProperty]}
            onClick={() =>
              openNewPontoonTabAndClosePopup(
                pontoonSearchStringsWithStatus(
                  pontoonBaseUrl,
                  team,
                  category.status,
                ),
              )
            }
          />
        ))}
      </List>
      <BottomLink
        onClick={() =>
          openNewPontoonTabAndClosePopup(pontoonTeam(pontoonBaseUrl, team))
        }
      >
        Open {team.name} team page
      </BottomLink>
      {projectForCurrentTab ? (
        <>
          <BottomLink
            onClick={() =>
              openNewPontoonTabAndClosePopup(
                pontoonTeamsProject(pontoonBaseUrl, team, projectForCurrentTab),
              )
            }
          >
            Open {projectForCurrentTab.name} dashboard for {team.name}
          </BottomLink>
          <BottomLink
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
          </BottomLink>
          <BottomLink
            onClick={async () =>
              openNewTabAndClosePopup(
                newLocalizationBug({ team, url: (await getActiveTab()).url! }),
              )
            }
          >
            {`Report bug for localization of ${projectForCurrentTab.name} to ${team.name}`}
          </BottomLink>
        </>
      ) : (
        <BottomLink
          onClick={() => openNewTabAndClosePopup(newLocalizationBug({ team }))}
        >
          Report bug for {team.name} localization
        </BottomLink>
      )}
    </section>
  ) : (
    <></>
  );
};
