import React from 'react';
import { shallow } from 'enzyme';
import { PanelListItem } from './PanelListItem';

describe('<PanelListItem>', () => {

  it('has class to style in Firefox', () => {
    const wrapper = shallow(
      <PanelListItem />
    );

    expect(wrapper.find('li').hasClass('panel-list-item')).toBe(true);
  });

  it('renders', () => {
    const wrapper = shallow(
      <PanelListItem id="one" text="Text" />
    );

    expect(wrapper.find('li').text()).toBe('Text');
  });

});
