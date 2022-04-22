import React from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.section`
  width: 32%;
  height: 22em;
  margin-bottom: 2em;
  background: #272a2f;
  border: 1px solid #5e6475;
  text-align: center;
  display: grid;
  grid-template-rows: 15% 30% 40% 15%;

  @media screen and (max-width: 1024px) and (min-width: 640px) {
    width: 48%;
  }

  @media screen and (max-width: 640px) {
    width: 100%;
  }
`;

const Image = styled.img`
  margin: 1em auto;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Text = styled.p`
  padding: 2em;
`;

const Row = styled.div<{ order: number }>`
  ${({ order }) => css`
    grid-row-start: ${order};
    grid-row-end: ${order};
  `}
  margin: 0;
  padding: 0;
  display: table-cell;
  vertical-align: middle;
`;

export interface Props {
  title: string;
  imageSrc?: string;
  text: React.ReactNode | string;
  button: {
    text: string;
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
      <Row order={1}>
        <h3>{title}</h3>
      </Row>
      <Row order={2}>{imageSrc && <Image src={imageSrc} alt="" />}</Row>
      <Row order={3}>
        <Text>{text}</Text>
      </Row>
      <Row order={4}>
        <button className="pontoon-style" onClick={button.onClick}>
          {button.text}
        </button>
      </Row>
    </Wrapper>
  );
};
