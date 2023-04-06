import React from 'react';
import { css } from '@emotion/react';

import { colors } from '@frontend/commons/const';
import { Heading2 } from '@frontend/commons/components/pontoon/Heading2';
import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';
import { Page } from '@frontend/commons/components/pontoon/Page';

import { SnakeGameContextProvider } from '../SnakeGameContext';
import { SnakeGameBoard } from '../SnakeGameBoard';
import { SnakeGameInfo } from '../SnakeGameInfo';

const Wrapper: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css({
      textAlign: 'center',
      padding: '1em 0',
    })}
    {...props}
  />
);

const Board: React.FC<React.ComponentProps<typeof SnakeGameBoard>> = (
  props,
) => (
  <SnakeGameBoard
    css={css({
      margin: '0 auto',
      border: `3px solid ${colors.interactive.green}`,
      display: 'inline-block',
    })}
    {...props}
  />
);

export const App: React.FC = () => {
  return (
    <Page
      heading={
        <>
          <Heading2>Thank you for using Pontoon Add-on.</Heading2>
          <Heading3>Enjoy the game.</Heading3>
        </>
      }
    >
      <Wrapper>
        <SnakeGameContextProvider>
          <Board />
          <SnakeGameInfo />
        </SnakeGameContextProvider>
      </Wrapper>
    </Page>
  );
};
