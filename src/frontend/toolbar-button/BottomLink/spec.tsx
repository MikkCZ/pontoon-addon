import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { BottomLink } from '.';

describe('BottomLink', () => {
  it('renders text', () => {
    const wrapper = mount(<BottomLink onClick={jest.fn()}>TEXT</BottomLink>);

    expect(wrapper.find(BottomLink).text()).toBe('TEXT');
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    const wrapper = mount(<BottomLink onClick={onClick} />);

    act(() => {
      wrapper.find(BottomLink).simulate('click');
    });

    expect(onClick).toHaveBeenCalled();
  });
});
