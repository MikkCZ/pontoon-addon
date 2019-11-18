import React from 'react';
import { mount, shallow } from 'enzyme';
import { PanelSection } from './PanelSection';
import { PanelListItem } from './PanelListItem';

describe('<PanelSection>', () => {

  it('has class to style in Firefox', () => {
    const wrapper = shallow(
      <PanelSection />
    );

    expect(wrapper.find('ul').hasClass('panel-section')).toBe(true);
    expect(wrapper.find('ul').hasClass('panel-section-list')).toBe(true);
  });

  it('renders items', () => {
    const wrapper = mount(
      <PanelSection items={[
        {
          text: 'Text 1',
          onClick: () => {},
        },
        {
          text: 'Text 2',
          onClick: () => {},
        }
      ]}/>
    );

    expect(wrapper.find(PanelListItem)).toHaveLength(2);
    expect(wrapper.find(PanelListItem).at(0).text()).toBe('Text 1');
    expect(wrapper.find(PanelListItem).at(1).text()).toBe('Text 2');
  });

});
