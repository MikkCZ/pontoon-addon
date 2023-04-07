import React from 'react';
import { render, screen, within } from '@testing-library/react';

import { App } from '.';

jest.mock('@commons/webExtensionsApi');

function pageHeading() {
  return screen.getByTestId('page-heading');
}

function pageContent() {
  return screen.getByTestId('page-content');
}

describe('snake-game/App', () => {
  it('renders Page components', () => {
    render(<App />);

    expect(pageContent()).toBeInTheDocument();
  });

  it('renders content', () => {
    render(<App />);

    expect(
      within(pageHeading()).getByRole('heading', { level: 2 }),
    ).toHaveTextContent('Thank you for using Pontoon Add-on.');
    expect(
      within(pageHeading()).getByRole('heading', { level: 3 }),
    ).toHaveTextContent('Enjoy the game.');
    expect(
      within(pageContent()).getByTestId('snake-game-board'),
    ).toBeInTheDocument();
    expect(
      within(pageContent()).getByTestId('snake-game-info'),
    ).toBeInTheDocument();
  });
});
