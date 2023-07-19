import React from 'react';
import { css } from '@emotion/react';

import pontoonLogo from '@assets/img/pontoon-logo.svg';
import { colors, sizes } from '@frontend/commons/const';

import { GlobalBodyStyle } from '../../../GlobalBodyStyle';

import { Link } from './Link';

const Header: React.FC<React.ComponentProps<'header'>> = (props) => (
  <header
    css={css([
      {
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0.5em',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: sizes.font.large,
      },
      {
        '*': {
          margin: '0',
          padding: '0',
        },
      },
    ])}
    {...props}
  />
);

const HeaderItem: React.FC<React.ComponentProps<'li'>> = (props) => (
  <li
    css={css([
      {
        display: 'inline-block',
        margin: '0 1em',
      },
      {
        ':last-child': {
          marginRight: '0',
        },
      },
    ])}
    {...props}
  />
);

const HeaderLink: React.FC<React.ComponentProps<typeof Link>> = (props) => (
  <Link
    css={css([
      {
        color: 'inherit',
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

const HeadingSection: React.FC<React.ComponentProps<'section'>> = (props) => (
  <section
    css={css({
      padding: '2em',
      backgroundColor: colors.background.light,
      textAlign: 'center',
    })}
    {...props}
  />
);

interface Props extends Pick<React.ComponentProps<'main'>, 'children'> {
  bodyBackgroundColor?: React.ComponentProps<
    typeof GlobalBodyStyle
  >['backgroundColor'];
  bodyExtra?: React.ComponentProps<typeof GlobalBodyStyle>['extra'];
  withHeader?: boolean;
  headerLinks?: Array<{
    text: React.ComponentProps<typeof HeaderLink>['children'];
    onClick: () => void;
  }>;
  heading?: React.ComponentProps<typeof HeadingSection>['children'];
}

export const Page: React.FC<Props> = ({
  bodyBackgroundColor,
  bodyExtra,
  withHeader = true,
  headerLinks = [],
  heading,
  children,
}) => {
  return (
    <>
      <GlobalBodyStyle
        backgroundColor={bodyBackgroundColor}
        extra={bodyExtra}
      />
      {withHeader && (
        <Header data-testid="page-header">
          <img
            css={css({
              height: '32px',
            })}
            src={pontoonLogo}
            alt="Pontoon logo"
          />
          {headerLinks.length > 0 && (
            <nav>
              <ul>
                {headerLinks.map(({ text, onClick }, index) => (
                  <HeaderItem key={index}>
                    <HeaderLink onClick={onClick}>{text}</HeaderLink>
                  </HeaderItem>
                ))}
              </ul>
            </nav>
          )}
        </Header>
      )}
      {heading && (
        <HeadingSection data-testid="page-heading">{heading}</HeadingSection>
      )}
      <main data-testid="page-content">{children}</main>
    </>
  );
};
