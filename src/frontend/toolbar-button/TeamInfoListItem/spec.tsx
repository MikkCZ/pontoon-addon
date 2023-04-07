import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { TeamInfoListItem, Square, Label, Value, ItemLink } from '.';

describe('TeamInfoListItem', () => {
  it('renders', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <TeamInfoListItem label="LABEL" value="VALUE" onClick={onClick} />,
    );

    expect(wrapper.find(ItemLink).find(Square)).toHaveLength(1);
    expect(wrapper.find(ItemLink).find(Label).text()).toBe('LABEL');
    expect(wrapper.find(ItemLink).find(Value).text()).toBe('VALUE');
    act(() => {
      wrapper.find(ItemLink).find('button').simulate('click');
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render any link if no onClick action is provided', () => {
    const wrapper = shallow(<TeamInfoListItem label="LABEL" value="VALUE" />);

    expect(wrapper.find(ItemLink)).toHaveLength(0);
  });
});
