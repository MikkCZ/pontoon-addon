import React from 'react';
import { css } from '@emotion/react';

import { sizes } from '@frontend/commons/const';

export const Heading2: React.FC<React.ComponentProps<'h2'>> = ({
  children,
  ...props
}) => (
  <h2
    css={css({
      fontSize: sizes.font.heading2,
      fontWeight: 'normal',
    })}
    {...props}
  >
    {children}
  </h2>
);
