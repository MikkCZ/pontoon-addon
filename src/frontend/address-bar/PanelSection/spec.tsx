import React from 'react';
import { render, screen } from '@testing-library/react';

import { PanelSection } from '.';

describe('PanelSection', () => {
  it('has class to style in Firefox', () => {
    render(<PanelSection items={[]} />);

    expect(screen.getByRole('list')).toHaveClass('panel-section');
    expect(screen.getByRole('list')).toHaveClass('panel-section-list');
  });

  it('renders items', () => {
    render(
      <PanelSection
        items={[
          { text: 'Text 1', onClick: jest.fn() },
          { text: 'Text 2', onClick: jest.fn() },
        ]}
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Text 1');
    expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Text 2');
  });
});
