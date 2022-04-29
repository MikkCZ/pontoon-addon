import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { GlobalPontoonStyle } from '@commons/GlobalPontoonStyle';
import privacyMdAsString from '@assets/PRIVACY.md';

import { MarkdownContent } from '../MarkdownContent';

const GlobalStyle = createGlobalStyle`
  body {
    background: #333941;
    font-family: sans-serif;
    font-size: 14px;
  }
`;

const Wrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;

  h1 {
    text-align: center;
  }
`;

export const App: React.FC = () => {
  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <Wrapper>
        <h1>Privacy policy</h1>
        <MarkdownContent markdownText={privacyMdAsString} />
      </Wrapper>
    </>
  );
};
