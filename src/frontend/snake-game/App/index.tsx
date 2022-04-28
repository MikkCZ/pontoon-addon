import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { GlobalPontoonStyle } from '@commons/GlobalPontoonStyle';

import { SnakeGameContextProvider } from '../SnakeGameContext';
import { SnakeGameBoard } from '../SnakeGameBoard';
import { SnakeGameInfo } from '../SnakeGameInfo';

const GlobalStyle = createGlobalStyle`
  body {
    background: #333941;
    font-family: sans-serif;
    font-size: 14px;
  }
`;

const Wrapper = styled.div`
  text-align: center;
`;

const Title = styled.h2`
  text-align: center;
`;

const SubTitle = styled.h3`
  text-align: center;
`;

const Board = styled(SnakeGameBoard)`
  margin: 0 auto;
  border: 3px solid #7bc876;
  display: inline-block;
`;

export const App: React.FC = () => {
  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <Wrapper>
        <Title>Thank you for using Pontoon Add-on.</Title>
        <SubTitle>Enjoy the game.</SubTitle>
        <SnakeGameContextProvider>
          <Board />
          <SnakeGameInfo />
        </SnakeGameContextProvider>
      </Wrapper>
    </>
  );
};
