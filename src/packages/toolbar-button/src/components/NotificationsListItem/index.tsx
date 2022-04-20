/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions */
import React, { MouseEvent } from 'react';
import ReactTimeAgo from 'react-time-ago';
import DOMPurify from 'dompurify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Linkify from 'react-linkify';
import parse from 'html-react-parser';
import type { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';
import { browser } from '@pontoon-addon/commons/src/webExtensionsApi';

import './index.css';

interface Props {
  unread: boolean;
  actor?: {
    anchor: string;
    url: string;
  };
  target?: {
    anchor: string;
    url: string;
  };
  verb?: string;
  description?: {
    safe: boolean;
    content?: string;
    is_comment?: boolean;
  };
  date_iso?: string;
  backgroundPontoonClient: BackgroundPontoonClient;
}

async function openTeamProject(
  backgroundPontoonClient: BackgroundPontoonClient,
  projectUrl: string
): Promise<void> {
  const teamProjectUrl = await backgroundPontoonClient.getTeamProjectUrl(
    projectUrl
  );
  await browser.tabs.create({ url: teamProjectUrl });
  window.close();
}

function stopEvent(e: MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();
}

export const NotificationsListItem: React.FC<Props> = ({
  unread,
  actor,
  target,
  verb,
  description,
  date_iso,
  backgroundPontoonClient,
}) => {
  const linkUrls = [actor, target]
    .filter((it) => it)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((it) => it!.url);
  const onClickAll = (e: MouseEvent): void => {
    if (linkUrls.length === 1) {
      stopEvent(e);
      openTeamProject(backgroundPontoonClient, linkUrls[0]);
    }
  };
  const isSuggestion =
    description?.content?.startsWith('Unreviewed suggestions') ||
    verb === 'has reviewed suggestions';
  if (isSuggestion) {
    return (
      <li
        className={`NotificationsListItem ${unread ? 'unread' : 'read'} ${
          linkUrls.length === 1 ? 'pointer' : ''
        }`}
        onClick={onClickAll}
      >
        {description &&
          description.content &&
          (description.safe ? (
            <div
              onClick={onClickAll}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description.content),
              }}
            ></div>
          ) : (
            <div onClick={onClickAll}>
              <Linkify
                properties={{
                  className: 'link',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content)}
              </Linkify>
            </div>
          ))}
        {date_iso && (
          <div className="NotificationsListItem-timeago" onClick={onClickAll}>
            <ReactTimeAgo date={new Date(date_iso)} />
          </div>
        )}
      </li>
    );
  } else {
    return (
      <li
        className={`NotificationsListItem ${unread ? 'unread' : 'read'} ${
          linkUrls.length === 1 ? 'pointer' : ''
        }`}
        onClick={onClickAll}
      >
        {actor && !isSuggestion && (
          <button
            className="link"
            onClick={(e) => {
              stopEvent(e);
              openTeamProject(backgroundPontoonClient, actor.url);
            }}
          >
            {actor.anchor}
          </button>
        )}
        {verb && <span onClick={onClickAll}> {verb} </span>}
        {target && (
          <button
            className="link"
            onClick={(e) => {
              stopEvent(e);
              openTeamProject(backgroundPontoonClient, target.url);
            }}
          >
            {target.anchor}
          </button>
        )}
        {date_iso && (
          <div className="NotificationsListItem-timeago" onClick={onClickAll}>
            <ReactTimeAgo date={new Date(date_iso)} />
          </div>
        )}
        {description &&
          description.content &&
          (description.safe ? (
            <div
              className="NotificationsListItem-description"
              onClick={onClickAll}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description.content),
              }}
            ></div>
          ) : (
            <div
              className="NotificationsListItem-description"
              onClick={onClickAll}
            >
              <Linkify
                properties={{
                  className: 'link',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content)}
              </Linkify>
            </div>
          ))}
      </li>
    );
  }
};
