import React from 'react';
import { render, screen, act } from '@testing-library/react';

import { BottomLink } from '.';

describe('BottomLink', () => {
  it('renders text', () => {
    render(<BottomLink>TEXT</BottomLink>);

    expect(screen.getByRole('link')).toHaveTextContent('TEXT');
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    render(<BottomLink onClick={onClick} />);

    act(() => {
      screen.getByRole('link').click();
    });

    expect(onClick).toHaveBeenCalled();
  });
});
