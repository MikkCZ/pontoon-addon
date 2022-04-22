import React from 'react';
import { mount, shallow } from 'enzyme';

import { PanelListItem } from '../PanelListItem';

import { PanelSection } from '.';

describe('PanelSection', () => {
  it('has class to style in Firefox', () => {
    const wrapper = shallow(<PanelSection items={[]} />);

    expect(wrapper.find('ul').hasClass('panel-section')).toBeTruthy();
    expect(wrapper.find('ul').hasClass('panel-section-list')).toBeTruthy();
  });

  it('renders items', () => {
    const wrapper = mount(
      <PanelSection
        items={[
          { text: 'Text 1', onClick: jest.fn() },
          { text: 'Text 2', onClick: jest.fn() },
        ]}
      />,
    );

    expect(wrapper.find(PanelListItem)).toHaveLength(2);
    expect(wrapper.find(PanelListItem).at(0).text()).toBe('Text 1');
    expect(wrapper.find(PanelListItem).at(1).text()).toBe('Text 2');
  });
});
