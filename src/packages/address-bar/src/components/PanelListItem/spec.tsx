import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { PanelListItem } from '.';

describe('PanelListItem', () => {
  it('has class to style in Firefox', () => {
    const wrapper = shallow(<PanelListItem text="Text" onClick={jest.fn()} />);

    expect(wrapper.find('li').hasClass('panel-list-item')).toBeTruthy();
  });

  it('renders text', () => {
    const wrapper = shallow(<PanelListItem text="Text" onClick={jest.fn()} />);

    expect(wrapper.find('li').text()).toBe('Text');
  });

  it('calls the onClick handler', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<PanelListItem text="Text" onClick={onClick} />);

    act(() => {
      wrapper.find('li').simulate('click');
    });

    expect(onClick).toHaveBeenCalled();
  });
});
