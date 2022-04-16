import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import type { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import lightbulbIcon from '@assets/img/lightbulb-blue.svg';

import { browser } from '../../util/webExtensionsApi';
import { TeamInfoListItem } from '../TeamInfoListItem';
import { BottomLink } from '../BottomLink';

import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

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
  backgroundPontoonClient: BackgroundPontoonClient
): Promise<void> {
  const teamPageUrl = await backgroundPontoonClient.getTeamPageUrl();
  browser.tabs.create({ url: teamPageUrl }).then(() => window.close());
}

async function openTeamStringsWithStatus(
  backgroundPontoonClient: BackgroundPontoonClient,
  status: string
): Promise<void> {
  const searchUrl = await backgroundPontoonClient.getStringsWithStatusSearchUrl(
    status
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
    <section className="TeamInfo">
      <h1>
        <button
          className="link"
          onClick={() => openTeamPage(backgroundPontoonClient)}
        >
          <span className="TeamInfo-name">{name}</span>{' '}
          <span className="TeamInfo-code">{code}</span>
        </button>
      </h1>
      <ul className="TeamInfo-list">
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
            status: 'fuzzy',
            text: 'fuzzy',
            dataProperty: 'fuzzyStrings',
            labelBeforeStyle: { backgroundColor: '#fed271' },
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
            labelBeforeStyle={category.labelBeforeStyle}
            label={category.text}
            value={stringsData ? stringsData[category.dataProperty] : ''}
            onClick={() =>
              openTeamStringsWithStatus(
                backgroundPontoonClient,
                category.status
              )
            }
          />
        ))}
      </ul>
      <BottomLink
        className="TeamInfo-team-page"
        text="Open team page"
        onClick={() => openTeamPage(backgroundPontoonClient)}
      />
    </section>
  );
};
