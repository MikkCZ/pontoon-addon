import React from 'react';
import { css } from '@emotion/react';

import { colors, sizes } from '@frontend/commons/const';

export const Heading3: React.FC<React.ComponentProps<'h3'>> = ({
  children,
  ...props
}) => (
  <h3
    css={css({
      fontSize: sizes.font.heading3,
      fontStyle: 'italic',
      fontWeight: 'normal',
      color: colors.interactive.green,
    })}
    {...props}
  >
    {children}
  </h3>
);
