import React from 'react';
import { css } from '@emotion/react';

import { border, colors } from '@frontend/commons/const';

export const SelectInput: React.FC<React.ComponentProps<'select'>> = (
  props,
) => (
  <select
    css={css({
      cursor: 'pointer',
      appearance: 'none',
      boxSizing: 'border-box',
      height: '2em',
      padding: '0 0.5em',
      backgroundColor: colors.background.light,
      border: `1px solid ${colors.interactive.gray}`,
      borderRadius: border.radius.lineItem,
      color: 'inherit',
    })}
    {...props}
  />
);
