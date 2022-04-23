/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions */
import React, { MouseEvent } from 'react';
import styled, { css } from 'styled-components';
import ReactTimeAgo from 'react-time-ago';
import DOMPurify from 'dompurify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Linkify from 'react-linkify';
// TODO: bug in ESLint?
// eslint-disable-next-line import/no-unresolved
import parse from 'html-react-parser';

import type { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { browser } from '@commons/webExtensionsApi';

export const Wrapper = styled.li<{ unread: boolean; pointer: boolean }>`
  ${({ unread }) =>
    unread
      ? css`
          background-color: #333941;
          border-bottom: 1px solid transparent;
        `
      : css`
          &:not(:last-child) {
            border-bottom: 1px solid #333941;
          }
        `}
  ${({ pointer }) =>
    pointer
      ? css`
          cursor: pointer;
        `
      : css``}
  padding: 0.5em 1em;

  &:hover {
    background-color: #3f4752;
  }
`;

export const ActorTargetLink = styled.button.attrs({ className: 'link' })`
  && {
    color: #f36;

    &:hover {
      color: #f36;
    }
  }
`;

export const Description = styled.div`
  color: #888;
`;

export const TimeAgo = styled.div`
  color: #888;
  text-align: right;
`;

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
  projectUrl: string,
): Promise<void> {
  const teamProjectUrl = await backgroundPontoonClient.getTeamProjectUrl(
    projectUrl,
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
      <Wrapper
        unread={unread}
        pointer={linkUrls.length === 1}
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
          <TimeAgo onClick={onClickAll}>
            <ReactTimeAgo date={new Date(date_iso)} />
          </TimeAgo>
        )}
      </Wrapper>
    );
  } else {
    return (
      <Wrapper
        unread={unread}
        pointer={linkUrls.length === 1}
        onClick={onClickAll}
      >
        {actor && !isSuggestion && (
          <ActorTargetLink
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              stopEvent(e);
              openTeamProject(backgroundPontoonClient, actor.url);
            }}
          >
            {actor.anchor}
          </ActorTargetLink>
        )}
        {verb && <span onClick={onClickAll}> {verb} </span>}
        {target && (
          <ActorTargetLink
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              stopEvent(e);
              openTeamProject(backgroundPontoonClient, target.url);
            }}
          >
            {target.anchor}
          </ActorTargetLink>
        )}
        {date_iso && (
          <TimeAgo onClick={onClickAll}>
            <ReactTimeAgo date={new Date(date_iso)} />
          </TimeAgo>
        )}
        {description &&
          description.content &&
          (description.safe ? (
            <Description
              onClick={onClickAll}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description.content),
              }}
            ></Description>
          ) : (
            <Description onClick={onClickAll}>
              <Linkify
                properties={{
                  className: 'link',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content)}
              </Linkify>
            </Description>
          ))}
      </Wrapper>
    );
  }
};
