import React from 'react';
import { shallow } from 'enzyme';
import { TourPageTile } from '.';

describe('<TourPageTile>', () => {

  it('renders full tile', () => {
    const wrapper = shallow(
      <TourPageTile
        {...{
          title: 'TITLE',
          image: 'mock.jpg',
          text: 'Lorem Ipsum',
          button: {
            text: 'Lipsum...',
            onClick: () => {},
          },
        }}
      />
    );

    expect(wrapper.find('.TourPageTile h3').text()).toBe('TITLE');
    expect(wrapper.find('.TourPageTile img')).toHaveLength(1);
    expect(wrapper.find('.TourPageTile p').text()).toBe('Lorem Ipsum');
    expect(wrapper.find('.TourPageTile button').text()).toBe('Lipsum...');
  });

  it('renders minimal section', () => {
    const wrapper = shallow(
      <TourPageTile
        {...{
          title: 'TITLE',
          text: 'Lorem Ipsum',
        }}
      />
    );

    expect(wrapper.find('.TourPageTile h3').text()).toBe('TITLE');
    expect(wrapper.find('.TourPageTile img')).toHaveLength(0);
    expect(wrapper.find('.TourPageTile p').text()).toBe('Lorem Ipsum');
    expect(wrapper.find('.TourPageTile button')).toHaveLength(0);
  });

});
