import type { ComponentProps } from 'react';
import React from 'react';
import { css } from '@emotion/react';

import { colors } from '@frontend/commons/const';

interface Props extends ComponentProps<'a'> {
  href: NonNullable<ComponentProps<'a'>['href']>;
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
