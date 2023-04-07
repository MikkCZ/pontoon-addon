import React from 'react';
import { css } from '@emotion/react';

import { colors } from '@frontend/commons/const';

interface Props extends React.ComponentProps<'a'> {
  href: NonNullable<React.ComponentProps<'a'>['href']>;
}

export const NativeLink: React.FC<Props> = ({ href, children, ...props }) => (
  <a
    href={href}
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
