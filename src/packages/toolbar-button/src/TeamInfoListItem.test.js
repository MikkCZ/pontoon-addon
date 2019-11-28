import React from 'react';
import { mount, shallow } from 'enzyme';
import { TeamInfoListItem } from './TeamInfoListItem';

describe('<TeamInfoListItem>', () => {

  it('renders', () => {
    let clicked = 0;
    const wrapper = mount(
      <TeamInfoListItem
        labelBeforeStyle={{backgroundColor: 'black'}}
        label="LABEL"
        value="VALUE"
        onClick={() => clicked++}
      />
    );

    expect(wrapper.find('.TeamInfoListItem-label-before').getDOMNode()).toHaveStyle('background-color: black');
    expect(wrapper.find('.TeamInfoListItem-label').text()).toBe('LABEL');
    expect(wrapper.find('.TeamInfoListItem-value').text()).toBe('VALUE');
    ['.TeamInfoListItem-label-before', '.TeamInfoListItem-label', '.TeamInfoListItem-value'].forEach(
      (query) => wrapper.find(query).simulate('click')
    );
    expect(clicked).toBe(3);
  });

  it('does not render any link if no onClick action is provided', () => {
    const wrapper = shallow(
      <TeamInfoListItem />
    );

    expect(wrapper.find('.link').length).toBe(0);
  });

});
