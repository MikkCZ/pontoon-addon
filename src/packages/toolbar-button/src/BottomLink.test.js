import React from 'react';
import { shallow } from 'enzyme';
import { BottomLink } from './BottomLink';

describe('<BottomLink>', () => {

  it('has text', () => {
    const wrapper = shallow(
      <BottomLink text="TEXT" />
    );

    expect(wrapper.find('.BottomLink').text()).toBe('TEXT');
  });

  it('calls on click', () => {
    let clicked = false;
    const wrapper = shallow(
      <BottomLink onClick={() => {clicked = true;}} />
    );

    wrapper.find('.BottomLink').simulate('click');

    expect(clicked).toBe(true);
  });

});
