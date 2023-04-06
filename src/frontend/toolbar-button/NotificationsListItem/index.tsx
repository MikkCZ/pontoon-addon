/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import type { MouseEvent } from 'react';
import React from 'react';
import { css } from '@emotion/react';
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
import { Link } from '@frontend/commons/components/pontoon/Link';
import { NativeLink } from '@frontend/commons/components/pontoon/NativeLink';
import { colors } from '@frontend/commons/const';

export const Wrapper: React.FC<
  React.ComponentProps<'li'> & {
    unread: boolean;
    hasSingleLink: boolean;
  }
> = ({ unread, hasSingleLink, ...props }) => (
  <li
    css={css([
      {
        padding: '0.5em 1em',
      },
      unread
        ? {
            backgroundColor: colors.background.light,
            borderBottom: '1px solid transparent',
          }
        : {
            ':not(:last-child)': {
              borderBottom: `1px solid ${colors.background.light}`,
            },
          },
      hasSingleLink ? { cursor: 'pointer' } : {},
      {
        ':hover': {
          backgroundColor: colors.background.toolbarButtonItemHover,
        },
      },
    ])}
    {...props}
  />
);

export const ActorTargetLink: React.FC<React.ComponentProps<typeof Link>> = (
  props,
) => (
  <Link
    css={css([
      {
        color: colors.interactive.red,
      },
      {
        ':hover': {
          color: colors.interactive.red,
        },
      },
    ])}
    {...props}
  />
);

export const Description: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css({
      color: colors.font.veryLight,
    })}
    {...props}
  />
);

export const TimeAgo: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css({
      color: colors.font.veryLight,
      textAlign: 'right',
    })}
    {...props}
  />
);

interface Props
  extends Pick<
    StorageContent['notificationsData'][number],
    'unread' | 'actor' | 'target' | 'verb' | 'description' | 'date_iso'
  > {
  pontoonBaseUrl: string;
}

function wrapLinks(pontoonBaseUrl: string): HTMLReactParserOptions['replace'] {
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
          <NativeLink
            href={href}
            onClick={(e) => {
              if (pontoonLinkUrl) {
                stopEvent(e);
                openNewPontoonTab(pontoonLinkUrl);
              }
            }}
          >
            {domToReact(domNode.children)}
          </NativeLink>
        );
      } else {
        return (
          <NativeLink href={href} target="_blank" rel="noopener noreferrer">
            {domToReact(domNode.children)}
          </NativeLink>
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
      <Wrapper
        unread={unread}
        hasSingleLink={hasSingleLink}
        onClick={openSingleLink}
      >
        {description &&
          description.content &&
          (description.safe ? (
            <div onClick={openSingleLink}>
              {parse(DOMPurify.sanitize(description.content), {
                replace: wrapLinks(pontoonBaseUrl),
              })}
            </div>
          ) : (
            <div onClick={openSingleLink}>
              <Linkify
                component={NativeLink}
                properties={{
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content, {
                  replace: wrapLinks(pontoonBaseUrl),
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
      <Wrapper
        unread={unread}
        hasSingleLink={hasSingleLink}
        onClick={openSingleLink}
      >
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
                replace: wrapLinks(pontoonBaseUrl),
              })}
            </Description>
          ) : (
            <Description onClick={openSingleLink}>
              <Linkify
                component={NativeLink}
                properties={{
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {parse(description.content, {
                  replace: wrapLinks(pontoonBaseUrl),
                })}
              </Linkify>
            </Description>
          ))}
      </Wrapper>
    );
  }
};
