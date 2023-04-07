import React from 'react';
import { css } from '@emotion/react';

import { border, colors } from '@frontend/commons/const';
import { Link } from '@frontend/commons/components/pontoon/Link';

export const Square: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    css={css({
      display: 'inline-block',
      content: '""',
      width: '0.9em',
      height: '0.9em',
      marginRight: '0.5em',
      borderRadius: border.radius.inlineItem,
    })}
    {...props}
  />
);

export const Label: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    css={css({
      marginRight: '1em',
      textTransform: 'uppercase',
    })}
    {...props}
  />
);

export const Value: React.FC<React.ComponentProps<'span'>> = (props) => (
  <span
    css={css({
      float: 'right',
    })}
    {...props}
  />
);

export const ItemLink: React.FC<React.ComponentProps<typeof Link>> = (
  props,
) => (
  <Link
    css={css([
      {
        display: 'inline-block',
        width: '100%',
        color: colors.font.default,
      },
      {
        ':hover': {
          color: colors.interactive.green,
        },
      },
    ])}
    {...props}
  />
);

interface Props {
  squareStyle?: Parameters<typeof css>[1];
  label: React.ComponentProps<typeof Label>['children'];
  value: React.ComponentProps<typeof Value>['children'];
  onClick?: React.ComponentProps<typeof ItemLink>['onClick'];
}

export const TeamInfoListItem: React.FC<Props> = ({
  squareStyle,
  label,
  value,
  onClick,
}) => {
  const children = (
    <>
      <Square css={css(squareStyle)} />
      <Label>{label}</Label>
      <Value>{value}</Value>
    </>
  );
  return (
    <li>
      {onClick ? <ItemLink onClick={onClick}>{children}</ItemLink> : children}
    </li>
  );
};
