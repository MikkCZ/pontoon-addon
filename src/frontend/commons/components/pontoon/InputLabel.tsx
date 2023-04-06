import React from 'react';
import { css } from '@emotion/react';

export const InputLabel: React.FC<React.ComponentProps<'label'>> = (props) => (
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  <label
    css={css({
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    })}
    {...props}
  />
);
