import React from 'react';
import { mount, shallow } from 'enzyme';

import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { CloseButton } from '../CloseButton';
import { TourPageTile } from '../TourPageTile';

import { TourPage, PrivacyPolicyLinkWrapper } from '.';

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.runtime.getURL
    .expect('frontend/privacy-policy.html')
    .andReturn('moz-extension://foo-bar');
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('TourPage', () => {
  it('renders close button', () => {
    const wrapper = shallow(<TourPage />);

    expect(wrapper.find(CloseButton)).toHaveLength(1);
  });

  it('renders title', () => {
    const wrapper = mount(<TourPage title="TITLE" />);

    expect(wrapper.find('h2').text()).toBe('TITLE');
  });

  it('renders content', () => {
    const wrapper = shallow(
      <TourPage
        tiles={[
          {
            title: '',
            image: null,
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
    const wrapper = mount(<TourPage />);

    expect(wrapper.find(PrivacyPolicyLinkWrapper).text()).toBe(
      'Privacy policy',
    );
  });
});
