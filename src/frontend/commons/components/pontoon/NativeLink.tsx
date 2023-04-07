import React from 'react';
import { css } from '@emotion/react';

import { colors } from '@frontend/commons/const';

export const NativeLink: React.FC<React.ComponentProps<'a'>> = ({
  children,
  ...props
}) => (
  <a
    css={css([
      {
        color: colors.interactive.green,
        textDecoration: 'none',
        cursor: 'pointer',
      },
      {
        ':hover': {
          color: 'inherit',
        },
      },
    ])}
    {...props}
  >
    {children}
  </a>
);
