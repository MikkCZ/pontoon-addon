import React from 'react';
import { css } from '@emotion/react';

import { border, colors } from '@frontend/commons/const';

export const Button: React.FC<React.ComponentProps<'button'>> = (props) => (
  <button
    data-testid="button"
    css={css([
      {
        cursor: 'pointer',
        appearance: 'none',
        boxSizing: 'border-box',
        height: '2em',
        padding: '0 1em',
        backgroundColor: colors.interactive.green,
        border: `1px solid ${colors.interactive.green}`,
        borderRadius: border.radius.lineItem,
        color: colors.font.dark,
      },
      {
        ':hover': {
          color: colors.font.default,
        },
      },
    ])}
    {...props}
  />
);
