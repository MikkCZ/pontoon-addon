import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import ReactTimeAgo from 'react-time-ago';

import lightbulbImage from '@assets/img/lightbulb-blue.svg';
import type { StorageContent } from '@commons/webExtensionsApi';
import { getFromStorage, openNewTab } from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import {
  newLocalizationBug,
  pontoonSearchStringsWithStatus,
  pontoonTeam,
} from '@commons/webLinks';
import { getPontoonProjectForTheCurrentTab } from '@commons/backgroundMessaging';
import { doAsync, openNewPontoonTab } from '@commons/utils';
import { colors } from '@frontend/commons/const';
import { ButtonPopupBottomLink } from '@frontend/commons/components/ButtonPopupBottomLink';
import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';
import { Link } from '@frontend/commons/components/pontoon/Link';
import { ProjectLinks } from '@frontend/address-bar/ProjectLinks';

import { TeamInfoListItem } from '../TeamInfoListItem';

const Title: React.FC<React.ComponentProps<typeof Heading3>> = ({
  children,
  ...props
}) => (
  <Heading3
    css={css({
      margin: '0 0.5em',
      padding: '0',
    })}
    {...props}
  >
    {children}
  </Heading3>
);

const TitleLink: React.FC<React.ComponentProps<typeof Link>> = (props) => (
  <Link
    css={css([
      {
        display: 'inline-block',
        width: '100%',
        color: colors.font.default,
      },
      {
        ':hover': {
          color: colors.interactive.green,
        },
      },
    ])}
    {...props}
  />
);

const List: React.FC<React.ComponentProps<'ul'>> = (props) => (
  <ul
    css={css({
      margin: '0 0.5em',
      listStyleType: 'none',
      padding: '0.5em 1em 0.5em 0.5em',
      color: colors.font.ultraLight,
      borderBottom: `1px solid ${colors.border.gray2}`,
    })}
    {...props}
  />
);

const Name: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    data-testid="team-name"
    css={css({
      fontWeight: 'bold',
      color: colors.font.default,
    })}
    {...props}
  />
);

const Code: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    data-testid="team-code"
    css={css({
      fontWeight: 'normal',
      color: colors.interactive.green,
    })}
    {...props}
  />
);

const STRING_CATEGORIES: Array<{
  status: string;
  label: React.ComponentProps<typeof TeamInfoListItem>['label'];
  dataProperty: keyof StorageContent['teamsList'][string]['strings'];
  labelBeforeStyle?: React.ComponentProps<
    typeof TeamInfoListItem
  >['squareStyle'];
}> = [
  {
    status: 'translated',
    label: 'translated',
    dataProperty: 'approvedStrings',
    labelBeforeStyle: { backgroundColor: colors.stringsStatus.translated },
  },
  {
    status: 'pretranslated',
    label: 'pretranslated',
    dataProperty: 'pretranslatedStrings',
    labelBeforeStyle: { backgroundColor: colors.stringsStatus.pretranslated },
  },
  {
    status: 'warnings',
    label: 'warnings',
    dataProperty: 'stringsWithWarnings',
    labelBeforeStyle: { backgroundColor: colors.stringsStatus.warning },
  },
  {
    status: 'errors',
    label: 'errors',
    dataProperty: 'stringsWithErrors',
    labelBeforeStyle: { backgroundColor: colors.stringsStatus.error },
  },
  {
    status: 'missing',
    label: 'missing',
    dataProperty: 'missingStrings',
    labelBeforeStyle: { backgroundColor: colors.stringsStatus.missing },
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
    doAsync(async () => {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setTeam(teamsList![teamCode]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setTeamActivity(latestTeamsActivity![teamCode]);
      setPontoonBaseUrl(pontoon_base_url);
    });
  }, []);

  return team && pontoonBaseUrl ? (
    <>
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
      </section>
      <section>
        <ButtonPopupBottomLink
          onClick={() =>
            openNewPontoonTabAndClosePopup(pontoonTeam(pontoonBaseUrl, team))
          }
        >
          Open {team.name} team page
        </ButtonPopupBottomLink>
        {!projectForCurrentTab && (
          <ButtonPopupBottomLink
            onClick={() => openNewTabAndClosePopup(newLocalizationBug({ team }))}
          >
            Report bug for {team.name} localization
          </ButtonPopupBottomLink>
        )}
      </section>
      {projectForCurrentTab && (
        <ProjectLinks />
      )}
    </>
  ) : (
    <></>
  );
};
