import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen, within } from '@testing-library/react';

import { TourPage } from '.';

jest.mock('@commons/webExtensionsApi');

const windowCloseSpy = jest.spyOn(window, 'close').mockReturnValue(undefined);

function pageHeader() {
  return screen.getByTestId('page-header');
}

function pageHeading() {
  return screen.getByTestId('page-heading');
}

function pageContent() {
  return screen.getByTestId('page-content');
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('TourPage', () => {
  it('renders Page component', () => {
    render(<TourPage title="TITLE" tiles={[]} />);

    expect(pageContent()).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <TourPage
        title="TITLE"
        tiles={[
          {
            title: '',
            text: '',
            button: {
              text: '',
              onClick: jest.fn(),
            },
          },
        ]}
      />,
    );

    const headerLink = within(pageHeader()).getByTestId('link');
    expect(headerLink).toBeInTheDocument();
    expect(within(headerLink).getByTestId('close-icon')).toBeInTheDocument();

    act(() => {
      headerLink.click();
    });

    expect(windowCloseSpy).toHaveBeenCalled();
  });

  it('renders title', () => {
    render(<TourPage title="TITLE" tiles={[]} />);

    expect(
      within(pageHeading()).getByRole('heading', { level: 1 }),
    ).toHaveTextContent('TITLE');
  });

  it('renders content', () => {
    render(
      <TourPage
        title="TITLE"
        tiles={[
          {
            title: '',
            text: '',
            button: {
              text: '',
              onClick: jest.fn(),
            },
          },
        ]}
      />,
    );

    expect(screen.getByTestId('tour-page-tile')).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    render(<TourPage title="TITLE" tiles={[]} />);

    expect(within(pageContent()).getByTestId('button')).toHaveTextContent(
      'Privacy policy',
    );
  });
});
