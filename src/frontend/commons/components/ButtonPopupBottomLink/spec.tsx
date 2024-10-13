import React from 'react';
import { render, screen, act } from '@testing-library/react';

import { ButtonPopupBottomLink } from '.';

describe('ButtonPopupBottomLink', () => {
  it('renders text', () => {
    render(<ButtonPopupBottomLink>TEXT</ButtonPopupBottomLink>);

    expect(screen.getByRole('link')).toHaveTextContent('TEXT');
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    render(<ButtonPopupBottomLink onClick={onClick} />);

    act(() => {
      screen.getByRole('link').click();
    });

    expect(onClick).toHaveBeenCalled();
  });
});
