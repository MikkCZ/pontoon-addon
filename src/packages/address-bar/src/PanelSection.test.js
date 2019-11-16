import React from 'react';
import { mount } from 'enzyme';
import { PanelSection } from './PanelSection';
import { PanelListItem } from './PanelListItem';

describe('<PanelSection>', () => {

  it('has Firefox style', () => {
    const wrapper = mount(
      <PanelSection />
    );

    expect(wrapper.find('ul').hasClass('panel-section')).toBe(true);
    expect(wrapper.find('ul').hasClass('panel-section-list')).toBe(true);
  });

  it('renders items', () => {
    const wrapper = mount(
      <PanelSection items={[
        {
          id: 'one',
          text: 'Text 1',
          onClick: () => {},
        },
        {
          id: 'two',
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
