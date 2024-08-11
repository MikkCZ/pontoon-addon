import React from 'react';
import { render, screen, within } from '@testing-library/react';

import { TourPageTile } from '.';

const WRAPPER_TEST_ID = 'tour-page-tile';

function wrapper() {
  return screen.getByTestId(WRAPPER_TEST_ID);
}

describe('TourPageTile', () => {
  it('renders with test id', () => {
    render(
      <TourPageTile
        {...{
          title: 'TITLE',
          imageSrc: 'mock.jpg',
          text: 'Lorem Ipsum',
          button: {
            text: 'Lipsum...',
            onClick: jest.fn(),
          },
        }}
      />,
    );

    expect(wrapper()).toBeInTheDocument();
  });

  it('renders full tile', () => {
    render(
      <TourPageTile
        {...{
          title: 'TITLE',
          imageSrc: 'mock.jpg',
          text: 'Lorem Ipsum',
          button: {
            text: 'Lipsum...',
            onClick: jest.fn(),
          },
        }}
      />,
    );

    expect(
      within(wrapper()).getByRole('heading', { level: 3 }),
    ).toHaveTextContent('TITLE');
    expect(within(wrapper()).getByTestId('mock.jpg')).toBeInTheDocument();
    expect(within(wrapper()).getByText('Lorem Ipsum')).toBeInTheDocument();
    expect(within(wrapper()).getByRole('button')).toHaveTextContent(
      'Lipsum...',
    );
  });

  it('renders tile without image', () => {
    render(
      <TourPageTile
        {...{
          title: 'TITLE',
          text: 'Lorem Ipsum',
          button: {
            text: 'Lipsum...',
            onClick: jest.fn(),
          },
        }}
      />,
    );

    expect(within(wrapper()).queryByRole('img')).not.toBeInTheDocument();
  });
});
