import React from 'react';
import { mount, shallow } from 'enzyme';

import { TourPageTile } from '../TourPageTile';

import { TourPage, CloseIcon, PrivacyPolicyLinkWrapper } from '.';

jest.mock('@commons/webExtensionsApi');

describe('TourPage', () => {
  it('renders close button', () => {
    const wrapper = shallow(<TourPage title="TITLE" tiles={[]} />);

    expect(wrapper.find(CloseIcon)).toHaveLength(1);
  });

  it('renders title', () => {
    const wrapper = mount(<TourPage title="TITLE" tiles={[]} />);

    expect(wrapper.find('h2').text()).toBe('TITLE');
  });

  it('renders content', () => {
    const wrapper = shallow(
      <TourPage
        title="TITLE"
        tiles={[
          {
            title: '',
            text: '',
            button: {
              text: '',
              onClick: jest.fn(),
            },
          },
        ]}
      />,
    );

    expect(wrapper.find(TourPageTile)).toHaveLength(1);
  });

  it('renders privacy policy link', () => {
    const wrapper = mount(<TourPage title="TITLE" tiles={[]} />);

    expect(wrapper.find(PrivacyPolicyLinkWrapper).text()).toBe(
      'Privacy policy',
    );
  });
});
