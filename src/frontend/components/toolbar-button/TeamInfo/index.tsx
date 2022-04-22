import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import styled from 'styled-components';

import type { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { browser } from '@commons/webExtensionsApi';
import lightbulbIcon from '@assets/img/lightbulb-blue.svg';

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
`;

export const Name = styled.span`
  font-weight: bold;
  color: #ebebeb;
`;

export const Code = styled.span`
  font-weight: normal;
  color: #7bc876;
`;

interface Props {
  name?: string;
  code?: string;
  stringsData?: any;
  latestActivity?: {
    user: string;
    date_iso?: string;
  };
  backgroundPontoonClient: BackgroundPontoonClient;
}

async function openTeamPage(
  backgroundPontoonClient: BackgroundPontoonClient,
): Promise<void> {
  const teamPageUrl = await backgroundPontoonClient.getTeamPageUrl();
  browser.tabs.create({ url: teamPageUrl }).then(() => window.close());
}

async function openTeamStringsWithStatus(
  backgroundPontoonClient: BackgroundPontoonClient,
  status: string,
): Promise<void> {
  const searchUrl = await backgroundPontoonClient.getStringsWithStatusSearchUrl(
    status,
  );
  browser.tabs.create({ url: searchUrl }).then(() => window.close());
}

export const TeamInfo: React.FC<Props> = ({
  name = '',
  code = '',
  stringsData,
  latestActivity,
  backgroundPontoonClient,
}) => {
  return (
    <section>
      <Title>
        <TitleLink onClick={() => openTeamPage(backgroundPontoonClient)}>
          <Name>{name}</Name> <Code>{code}</Code>
        </TitleLink>
      </Title>
      <List>
        {latestActivity && (
          <TeamInfoListItem
            key="activity"
            label="Activity"
            value={
              latestActivity.date_iso &&
              !isNaN(Date.parse(latestActivity.date_iso)) ? (
                <>
                  {latestActivity.user}{' '}
                  <ReactTimeAgo date={new Date(latestActivity.date_iso)} />
                </>
              ) : (
                '―'
              )
            }
          />
        )}
        {[
          {
            status: 'translated',
            text: 'translated',
            dataProperty: 'approvedStrings',
            labelBeforeStyle: { backgroundColor: '#7bc876' },
          },
          {
            status: 'pretranslated',
            text: 'pretranslated',
            dataProperty: 'pretranslatedStrings',
            labelBeforeStyle: { backgroundColor: '#c0ff00' },
          },
          {
            status: 'warnings',
            text: 'warnings',
            dataProperty: 'stringsWithWarnings',
            labelBeforeStyle: { backgroundColor: '#ffa10f' },
          },
          {
            status: 'errors',
            text: 'errors',
            dataProperty: 'stringsWithErrors',
            labelBeforeStyle: { backgroundColor: '#f36' },
          },
          {
            status: 'missing',
            text: 'missing',
            dataProperty: 'missingStrings',
            labelBeforeStyle: { backgroundColor: '#4d5967' },
          },
          {
            status: 'unreviewed',
            text: 'unreviewed',
            dataProperty: 'unreviewedStrings',
            labelBeforeStyle: {
              height: '1em',
              background: `center / contain no-repeat url(${lightbulbIcon})`,
            },
          },
          { status: 'all', text: 'all strings', dataProperty: 'totalStrings' },
        ].map((category) => (
          <TeamInfoListItem
            key={category.status}
            squareStyle={category.labelBeforeStyle}
            label={category.text}
            value={stringsData ? stringsData[category.dataProperty] : ''}
            onClick={() =>
              openTeamStringsWithStatus(
                backgroundPontoonClient,
                category.status,
              )
            }
          />
        ))}
      </List>
      <BottomLink
        text="Open team page"
        onClick={() => openTeamPage(backgroundPontoonClient)}
      />
    </section>
  );
};
