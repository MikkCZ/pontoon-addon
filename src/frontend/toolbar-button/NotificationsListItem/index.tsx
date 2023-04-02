/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions */
import type { MouseEvent } from 'react';
import React from 'react';
import styled, { css } from 'styled-components';
import ReactTimeAgo from 'react-time-ago';
import DOMPurify from 'dompurify';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Linkify from 'react-linkify';
import type { HTMLReactParserOptions, DOMNode } from 'html-react-parser';
import parse, { domToReact, Element } from 'html-react-parser';

import type { StorageContent } from '@commons/webExtensionsApi';
import { getTeamProjectUrl } from '@background/backgroundClient';
import { openNewPontoonTab } from '@commons/utils';

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

type Props = Pick<
  StorageContent['notificationsData'][number],
  'unread' | 'actor' | 'target' | 'verb' | 'description' | 'date_iso'
> & {
  pontoonBaseUrl: string;
};

function wrapLinksToPontoon(
  pontoonBaseUrl: string,
): HTMLReactParserOptions['replace'] {
  // eslint-disable-next-line react/display-name
  return (domNode: DOMNode): JSX.Element | void => {
    if (
      domNode instanceof Element &&
      domNode.name === 'a' &&
      domNode.attribs?.href
    ) {
      const href = domNode.attribs.href;
      let pontoonLinkUrl: string | undefined;
      if (href.startsWith('/')) {
        pontoonLinkUrl = `${pontoonBaseUrl}${href}`;
      } else if (href.startsWith(pontoonBaseUrl)) {
        pontoonLinkUrl = href;
      }
      if (pontoonLinkUrl) {
        return (
          <a
            href={href}
            onClick={(e) => {
              if (pontoonLinkUrl) {
                stopEvent(e);
                openNewPontoonTab(pontoonLinkUrl);
              }
            }}
          >
            {domToReact(domNode.children)}
          </a>
        );
      }
    }
  };
}

async function openTeamProject(projectUrl: string): Promise<void> {
  const teamProjectUrl = await getTeamProjectUrl(projectUrl);
  openNewPontoonTab(teamProjectUrl);
  window.close();
}

function stopEvent(e: MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();
}

export const NotificationsListItem: React.FC<Props> = ({
  pontoonBaseUrl,
  unread,
  actor,
  target,
  verb,
  description,
  date_iso,
}) => {
  const linkUrls = [actor, target]
    .filter((it) => it)
    .map(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (it) => it!.url,
    );
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
            <div onClick={openSingleLink}>
              {parse(DOMPurify.sanitize(description.content), {
                replace: wrapLinksToPontoon(pontoonBaseUrl),
              })}
            </div>
          ) : (
            <div onClick={openSingleLink}>
              <Linkify
                properties={{
                  className: 'link',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content, {
                  replace: wrapLinksToPontoon(pontoonBaseUrl),
                })}
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
            <Description onClick={openSingleLink}>
              {parse(DOMPurify.sanitize(description.content), {
                replace: wrapLinksToPontoon(pontoonBaseUrl),
              })}
            </Description>
          ) : (
            <Description onClick={openSingleLink}>
              <Linkify
                properties={{
                  className: 'link',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content, {
                  replace: wrapLinksToPontoon(pontoonBaseUrl),
                })}
              </Linkify>
            </Description>
          ))}
      </Wrapper>
    );
  }
};
