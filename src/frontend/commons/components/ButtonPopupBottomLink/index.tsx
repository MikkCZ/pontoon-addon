import React from 'react';
import { css } from '@emotion/react';

import { colors } from '../../const';
import { Link } from '../pontoon/Link';

export const ButtonPopupBottomLink: React.FC<
  React.ComponentProps<typeof Link>
> = (props) => (
  <Link
    css={css([
      {
        display: 'block',
        width: '100%',
        padding: '0.5em',
        textAlign: 'center',
        fontSize: '14px',
        color: colors.font.ultraLight,
      },
      {
        ':hover': {
          backgroundColor: colors.background.toolbarButtonItemHover,
          color: colors.font.white,
        },
      },
    ])}
    {...props}
  />
);
