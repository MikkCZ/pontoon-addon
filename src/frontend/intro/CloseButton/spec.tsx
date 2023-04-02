import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { CloseButton } from '.';

jest.spyOn(window, 'close').mockReturnValue(undefined);

afterEach(() => {
  jest.resetAllMocks();
});

describe('CloseButton', () => {
  it('renders title', () => {
    const wrapper = mount(<CloseButton title="TITLE" />);

    expect(wrapper.find('button').getDOMNode<HTMLElement>().title).toBe(
      'TITLE',
    );
  });

  it('closes intro page on click', async () => {
    const wrapper = mount(<CloseButton />);

    act(() => {
      wrapper.find('button').simulate('click');
    });

    expect(window.close).toHaveBeenCalled();
  });

  it('calls custom onClick handler', () => {
    const onClick = jest.fn();
    const wrapper = mount(<CloseButton onClick={onClick} />);

    act(() => {
      wrapper.find('button').simulate('click');
    });

    expect(onClick).toHaveBeenCalled();
  });
});
