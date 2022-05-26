/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions */
import type { MouseEvent } from 'react';
import React from 'react';
import styled, { css } from 'styled-components';
import ReactTimeAgo from 'react-time-ago';
import DOMPurify from 'dompurify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Linkify from 'react-linkify';
import parse from 'html-react-parser';

import { getTeamProjectUrl } from '@background/backgroundClient';
import { openNewTab } from '@commons/webExtensionsApi';

export const Wrapper = styled.li<{ unread: boolean; pointer?: boolean }>`
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
}

async function openTeamProject(projectUrl: string): Promise<void> {
  const teamProjectUrl = await getTeamProjectUrl(projectUrl);
  openNewTab(teamProjectUrl);
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
}) => {
  const linkUrls = [actor, target]
    .filter((it) => it)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map((it) => it!.url);
  const isSuggestion =
    description?.content?.startsWith(
      'Unreviewed suggestions have been submitted',
    ) || verb === 'has reviewed suggestions';
  const hasSingleLink =
    linkUrls.length === 1 && !isSuggestion && !description?.content;
  const openSingleLink = hasSingleLink
    ? (e: MouseEvent): void => {
        stopEvent(e);
        openTeamProject(linkUrls[0]);
      }
    : undefined;
  if (isSuggestion) {
    return (
      <Wrapper unread={unread} pointer={hasSingleLink} onClick={openSingleLink}>
        {description &&
          description.content &&
          (description.safe ? (
            <div
              onClick={openSingleLink}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description.content),
              }}
            ></div>
          ) : (
            <div onClick={openSingleLink}>
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
          <TimeAgo onClick={openSingleLink}>
            <ReactTimeAgo date={new Date(date_iso)} />
          </TimeAgo>
        )}
      </Wrapper>
    );
  } else {
    return (
      <Wrapper unread={unread} pointer={hasSingleLink} onClick={openSingleLink}>
        {actor && !isSuggestion && (
          <ActorTargetLink
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              stopEvent(e);
              openTeamProject(actor.url);
            }}
          >
            {actor.anchor}
          </ActorTargetLink>
        )}
        {verb && <span onClick={openSingleLink}> {verb} </span>}
        {target && (
          <ActorTargetLink
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              stopEvent(e);
              openTeamProject(target.url);
            }}
          >
            {target.anchor}
          </ActorTargetLink>
        )}
        {date_iso && (
          <TimeAgo onClick={openSingleLink}>
            <ReactTimeAgo date={new Date(date_iso)} />
          </TimeAgo>
        )}
        {description &&
          description.content &&
          (description.safe ? (
            <Description
              onClick={openSingleLink}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(description.content),
              }}
            ></Description>
          ) : (
            <Description onClick={openSingleLink}>
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
