import React from 'react';
import { css } from '@emotion/react';

import { colors } from '@frontend/commons/const';

export const Link: React.FC<React.ComponentProps<'button'>> = (props) => (
  <button
    role="link"
    css={css([
      {
        color: colors.interactive.green,
        textDecoration: 'none',
        cursor: 'pointer',

        appearance: 'none',
        display: 'inline-block',
        backgroundColor: 'transparent',
        border: 'none',
        margin: '0',
        padding: '0',
        fontSize: 'inherit',
      },
      {
        ':hover': {
          color: 'inherit',
        },
      },
    ])}
    {...props}
  />
);
