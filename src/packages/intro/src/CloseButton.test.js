import React from 'react';
import { mount } from 'enzyme';
import { CloseButton } from './CloseButton';

describe('<CloseButton>', () => {

  it('has close icon', () => {
    const wrapper = mount(
      <CloseButton />
    );

    expect(wrapper.find('button').getDOMNode()).toHaveStyle('background: url(close-16.svg) no-repeat center');
  });

  it('uses style from props', () => {
    const wrapper = mount(
      <CloseButton style={{ border: '1px solid black' }} />
    );

    expect(wrapper.find('button').getDOMNode()).toHaveStyle('border: 1px solid black');
  });

});
