import React from 'react';
import { mount, shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { TeamInfoListItem, Square, Label, Value, ItemLink } from '.';

describe('TeamInfoListItem', () => {
  it('renders', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <TeamInfoListItem
        squareStyle={{ backgroundColor: 'black' }}
        label="LABEL"
        value="VALUE"
        onClick={onClick}
      />,
    );

    expect(wrapper.find(Square).getDOMNode()).toHaveStyle(
      'background-color: black',
    );
    expect(wrapper.find(Label).text()).toBe('LABEL');
    expect(wrapper.find(Value).text()).toBe('VALUE');
    act(() => {
      [Square, Label, Value].forEach((query) =>
        wrapper.find(query).simulate('click'),
      );
    });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not render any link if no onClick action is provided', () => {
    const wrapper = shallow(<TeamInfoListItem label="LABEL" value="VALUE" />);

    expect(wrapper.find(ItemLink)).toHaveLength(0);
  });
});
