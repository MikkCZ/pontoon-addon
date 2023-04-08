import React from 'react';
import { render, screen, within, act } from '@testing-library/react';

import { TeamInfoListItem } from '.';

describe('TeamInfoListItem', () => {
  it('renders', () => {
    const onClick = jest.fn();
    render(<TeamInfoListItem label="LABEL" value="VALUE" onClick={onClick} />);

    const link = screen.getByRole('link');
    expect(within(link).getByTestId('square')).toBeInTheDocument();
    expect(within(link).getByTestId('label')).toHaveTextContent('LABEL');
    expect(within(link).getByTestId('value')).toHaveTextContent('VALUE');
    act(() => {
      link.click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render any link if no onClick action is provided', () => {
    render(<TeamInfoListItem label="LABEL" value="VALUE" />);

    expect(screen.queryByTestId('link')).not.toBeInTheDocument();
  });
});
