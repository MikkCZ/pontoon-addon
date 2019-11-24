import React from 'react';
import { shallow } from 'enzyme';
import { TourPage } from './TourPage';
import { CloseButton } from './CloseButton';
import { TourPageTile } from './TourPageTile';

describe('<TourPage>', () => {

  it('incudes close button', () => {
    const wrapper = shallow(
      <TourPage tiles={[]} />
    );

    expect(wrapper.find(CloseButton)).toHaveLength(1);
  });

  it('renders title', () => {
    const wrapper = shallow(
      <TourPage title='TITLE' tiles={[]} />
    );

    expect(wrapper.find('h2').text()).toBe('TITLE');
  });

  it('incudes content', () => {
    const wrapper = shallow(
      <TourPage tiles={[{}]} />
    );

    expect(wrapper.find(TourPageTile)).toHaveLength(1);
  });

});
