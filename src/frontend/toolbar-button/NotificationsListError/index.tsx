import React from 'react';
import styled from 'styled-components';

import { getSignInURL } from '@background/backgroundClient';
import { openNewTab } from '@commons/webExtensionsApi';

const Wrapper = styled.section`
  margin: 1em;
  text-align: center;
`;

const Title = styled.p`
  margin: 0;
  padding: 0;
  text-align: center;
  font-size: 16px;
  color: #ebebeb;
`;

const Description = styled.p`
  margin: 0;
  padding: 0;
  text-align: center;
  padding-top: 0.25em;
  font-size: 12px;
  color: #aaa;
`;

export const SignInLink = styled.button.attrs({ className: 'link' })`
  && {
    color: #f36;

    &:hover {
      color: #f36;
    }
  }
`;

export const NotificationsListError: React.FC = () => {
  return (
    <Wrapper>
      <Title>Error</Title>
      <Description>
        There was an error fetching data from Pontoon. Please check, if you are{' '}
        <SignInLink
          onClick={async () => {
            await openNewTab(await getSignInURL());
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
