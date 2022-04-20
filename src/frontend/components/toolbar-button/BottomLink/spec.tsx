import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { BottomLink } from '.';

describe('BottomLink', () => {
  it('renders text', () => {
    const wrapper = shallow(<BottomLink text="TEXT" onClick={jest.fn()} />);

    expect(wrapper.find('.BottomLink').text()).toBe('TEXT');
  });

  it('calls onClick handler', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<BottomLink text="" onClick={onClick} />);

    act(() => {
      wrapper.find('.BottomLink').simulate('click');
    });

    expect(onClick).toHaveBeenCalled();
  });
});
