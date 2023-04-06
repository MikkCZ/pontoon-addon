import React from 'react';
import { css } from '@emotion/react';

import { sizes } from '@frontend/commons/const';

export const Heading1: React.FC<React.ComponentProps<'h1'>> = ({
  children,
  ...props
}) => (
  <h1
    css={css({
      fontSize: sizes.font.heading2,
      fontWeight: 'normal',
    })}
    {...props}
  >
    {children}
  </h1>
);
