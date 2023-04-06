import React from 'react';
import { css } from '@emotion/react';

import { border, colors } from '@frontend/commons/const';

export const CheckboxInput: React.FC<React.ComponentProps<'input'>> = (
  props,
) => (
  <input
    type="checkbox"
    css={css([
      {
        appearance: 'none',
        height: '1em',
        width: '1em',
        verticalAlign: 'sub',
        marginTop: '0',
        border: `2px solid ${colors.interactive.gray}`,
        borderRadius: border.radius['checkbox/radio'],
        transition: '0.15s all linear',
      },
      {
        ':hover': {
          backgroundColor: colors.interactive.gray,
        },
      },
      {
        ':checked': {
          backgroundColor: colors.interactive.green,
          borderColor: colors.interactive.green,
        },
      },
    ])}
    {...props}
  />
);
