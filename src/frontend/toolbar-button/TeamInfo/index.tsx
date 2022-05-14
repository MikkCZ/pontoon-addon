import React, { CSSProperties, useState, useEffect } from 'react';
import ReactTimeAgo from 'react-time-ago';
import styled from 'styled-components';

import {
  getActiveTab,
  getFromStorage,
  openNewTab,
  StorageContent,
} from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';
import { newLocalizationBug } from '@commons/webLinks';
import {
  getTeamPageUrl,
  getStringsWithStatusSearchUrl,
  getPontoonProjectForTheCurrentTab,
} from '@background/backgroundClient';
import lightbulbImage from '@assets/img/lightbulb-blue.svg';

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

export const TeamInfo: React.FC = () => {
  const [projectForCurrentTab, setProjectForCurrentTab] = useState<
    StorageContent['projectsList'][string] | undefined
  >();
  const [team, setTeam] = useState<
    StorageContent['teamsList'][string] | undefined
  >();
  const [teamActivity, setTeamActivity] = useState<
    StorageContent['latestTeamsActivity'][string] | undefined
  >();

  useEffect(() => {
    (async () => {
      const [
        projectForCurrentTab,
        { teamsList, latestTeamsActivity },
        teamCode,
      ] = await Promise.all([
        getPontoonProjectForTheCurrentTab(),
        getFromStorage(['teamsList', 'latestTeamsActivity']),
        getOneOption('locale_team'),
      ]);
      setProjectForCurrentTab(projectForCurrentTab);
      setTeam(teamsList![teamCode]);
      setTeamActivity(latestTeamsActivity![teamCode]);
    })();
  }, []);

  return team ? (
    <section>
      <Title>
        <TitleLink
          onClick={async () => openNewTabAndClosePopup(await getTeamPageUrl())}
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
            onClick={async () =>
              openNewTabAndClosePopup(
                await getStringsWithStatusSearchUrl(category.status),
              )
            }
          />
        ))}
      </List>
      <BottomLink
        text="Open team page"
        onClick={async () => openNewTabAndClosePopup(await getTeamPageUrl())}
      />
      {projectForCurrentTab ? (
        <BottomLink
          text={`Report bug for localization of ${projectForCurrentTab.name} to ${team.name}`}
          onClick={async () =>
            openNewTabAndClosePopup(
              newLocalizationBug({ team, url: (await getActiveTab()).url! }),
            )
          }
        />
      ) : (
        <BottomLink
          text={`Report bug for ${team.name} localization`}
          onClick={() => openNewTabAndClosePopup(newLocalizationBug({ team }))}
        />
      )}
    </section>
  ) : (
    <></>
  );
};
