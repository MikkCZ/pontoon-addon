import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { PanelListItem } from '.';

describe('PanelListItem', () => {
  it('has class to style in Firefox', () => {
    render(<PanelListItem onClick={jest.fn()} />);

    expect(screen.getByRole('listitem')).toHaveClass('panel-list-item');
  });

  it('renders children', () => {
    render(<PanelListItem onClick={jest.fn()}>Text</PanelListItem>);

    expect(screen.getByRole('listitem')).toHaveTextContent('Text');
  });

  it('calls the onClick handler', () => {
    const onClick = jest.fn();
    render(<PanelListItem onClick={onClick}>Text</PanelListItem>);

    act(() => {
      screen.getByText('Text').click();
    });

    expect(onClick).toHaveBeenCalled();
  });
});
