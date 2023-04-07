import React from 'react';
import { css } from '@emotion/react';

import { colors } from '@frontend/commons/const';
import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';
import { Button } from '@frontend/commons/components/pontoon/Button';

const Wrapper: React.FC<React.ComponentProps<'section'>> = (props) => (
  <section
    css={css([
      {
        width: '32%',
        height: '22em',
        marginBottom: '2em',
        background: colors.background.default,
        border: `1px solid ${colors.border.gray}`,
        textAlign: 'center',
        display: 'grid',
        gridTemplateRows: '[title] 15% [image] 30% [text] 40% [button] 15%',
      },
      {
        '@media screen and (640px <= width <= 1024px)': {
          width: '48%',
        },
      },
      {
        '@media screen and (width <= 640px)': {
          width: '100%',
        },
      },
    ])}
    {...props}
  />
);

const Image: React.FC<React.ComponentProps<'img'>> = ({ alt, ...props }) => (
  <img
    css={css({
      margin: '1em auto',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    })}
    alt={alt}
    {...props}
  />
);

const Text: React.FC<React.ComponentProps<'p'>> = (props) => (
  <p
    css={css({
      padding: '2em',
    })}
    {...props}
  />
);

const Row: React.FC<
  React.ComponentProps<'div'> & {
    rowName: 'title' | 'image' | 'text' | 'button';
  }
> = ({ rowName, ...props }) => (
  <div
    css={css({
      gridRow: rowName,
      margin: '0',
      padding: '0',
      display: 'table-cell',
      verticalAlign: 'middle',
    })}
    {...props}
  />
);

interface Props {
  title: React.ComponentProps<'h3'>['children'];
  imageSrc?: React.ComponentProps<typeof Image>['src'];
  text: React.ComponentProps<typeof Text>['children'];
  button: {
    text: React.ComponentProps<typeof Button>['children'];
    onClick: () => void;
  };
}

export const TourPageTile: React.FC<Props> = ({
  title,
  imageSrc,
  text,
  button,
}) => {
  return (
    <Wrapper>
      <Row rowName="title">
        <Heading3>{title}</Heading3>
      </Row>
      {imageSrc && (
        <Row rowName="image">
          <Image src={imageSrc} alt="" />
        </Row>
      )}
      <Row rowName="text">
        <Text>{text}</Text>
      </Row>
      <Row rowName="button">
        <Button onClick={button.onClick}>{button.text}</Button>
      </Row>
    </Wrapper>
  );
};
