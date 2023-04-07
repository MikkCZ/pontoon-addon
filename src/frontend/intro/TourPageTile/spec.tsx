import React from 'react';
import { mount } from 'enzyme';

import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';

import { TourPageTile } from '.';

describe('TourPageTile', () => {
  it('renders full tile', () => {
    const wrapper = mount(
      <TourPageTile
        {...{
          title: 'TITLE',
          imageSrc: 'mock.jpg',
          text: 'Lorem Ipsum',
          button: {
            text: 'Lipsum...',
            onClick: jest.fn(),
          },
        }}
      />,
    );

    expect(wrapper.find(Heading3).text()).toBe('TITLE');
    expect(wrapper.find('img')).toHaveLength(1);
    expect(wrapper.find('p').text()).toBe('Lorem Ipsum');
    expect(wrapper.find('button').text()).toBe('Lipsum...');
  });

  it('renders tile without image', () => {
    const wrapper = mount(
      <TourPageTile
        {...{
          title: 'TITLE',
          text: 'Lorem Ipsum',
          button: {
            text: 'Lipsum...',
            onClick: jest.fn(),
          },
        }}
      />,
    );

    expect(wrapper.find('img')).toHaveLength(0);
  });
});
