import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { TeamInfoListItem } from '.';

describe('TeamInfoListItem', () => {
  it('renders', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <TeamInfoListItem
        labelBeforeStyle={{ backgroundColor: 'black' }}
        label="LABEL"
        value="VALUE"
        onClick={onClick}
      />
    );

    expect(
      wrapper.find('.TeamInfoListItem-label-before').getDOMNode()
    ).toHaveStyle('background-color: black');
    expect(wrapper.find('.TeamInfoListItem-label').text()).toBe('LABEL');
    expect(wrapper.find('.TeamInfoListItem-value').text()).toBe('VALUE');
    act(() => {
      [
        '.TeamInfoListItem-label-before',
        '.TeamInfoListItem-label',
        '.TeamInfoListItem-value',
      ].forEach((query) => wrapper.find(query).simulate('click'));
    });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not render any link if no onClick action is provided', () => {
    const wrapper = shallow(<TeamInfoListItem label="LABEL" value="VALUE" />);

    expect(wrapper.find('.link').length).toBe(0);
  });
});
