import React from 'react';
import type { CSSObject } from '@emotion/react';
import { css, Global } from '@emotion/react';

import { colors, sizes } from './commons/const';

interface Props {
  backgroundColor?: keyof (typeof colors)['background'];
  color?: keyof (typeof colors)['font'];
  extra?: Omit<CSSObject, 'background' | 'backgroundColor' | 'color'>;
}

export const GlobalBodyStyle: React.FC<Props> = ({
  backgroundColor = 'default',
  color = 'default',
  extra = {},
}) => (
  <Global
    styles={css([
      {
        body: {
          margin: '0',
          background: colors.background[backgroundColor],
          color: colors.font[color],
          fontSize: sizes.font.default,
          fontFamily:
            '"Open Sans", "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", "Verdana", sans-serif',
        },
      },
      {
        body: extra,
      },
    ])}
  />
);
