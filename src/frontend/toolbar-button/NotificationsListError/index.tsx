import React from 'react';
import { css } from '@emotion/react';

import { getSignInURL } from '@background/backgroundClient';
import { openNewPontoonTab } from '@commons/utils';
import { colors, sizes } from '@frontend/commons/const';
import { Link } from '@frontend/commons/components/pontoon/Link';

const Wrapper: React.FC<React.ComponentProps<'section'>> = (props) => (
  <section
    css={css({
      margin: '1em',
      textAlign: 'center',
    })}
    {...props}
  />
);

const Title: React.FC<React.ComponentProps<'p'>> = (props) => (
  <p
    css={css({
      margin: '0',
      padding: '0',
      textAlign: 'center',
      fontSize: sizes.font.large,
      color: colors.font.default,
    })}
    {...props}
  />
);

const Description: React.FC<React.ComponentProps<'p'>> = (props) => (
  <p
    css={css({
      margin: '0',
      padding: '0',
      textAlign: 'center',
      paddingTop: '0.25em',
      fontSize: sizes.font.small,
      color: colors.font.ultraLight,
    })}
    {...props}
  />
);

export const SignInLink: React.FC<React.ComponentProps<typeof Link>> = (
  props,
) => (
  <Link
    css={css([
      {
        color: colors.interactive.red,
      },
      {
        ':hover:': {
          color: colors.interactive.red,
        },
      },
    ])}
    {...props}
  />
);

export const NotificationsListError: React.FC = () => {
  return (
    <Wrapper>
      <Title>Error</Title>
      <Description>
        There was an error fetching data from Pontoon. Please check, if you are{' '}
        <SignInLink
          onClick={async () => {
            await openNewPontoonTab(await getSignInURL());
            window.close();
          }}
        >
          signed in
        </SignInLink>
        .
      </Description>
    </Wrapper>
  );
};
