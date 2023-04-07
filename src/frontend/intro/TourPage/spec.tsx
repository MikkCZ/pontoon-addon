import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

import { Page } from '@frontend/commons/components/pontoon/Page';
import { Heading1 } from '@frontend/commons/components/pontoon/Heading1';
import { Link } from '@frontend/commons/components/pontoon/Link';

import { TourPageTile } from '../TourPageTile';

import { TourPage, CloseIcon, PrivacyPolicyLinkWrapper } from '.';

jest.mock('@commons/webExtensionsApi');

const windowCloseSpy = jest.spyOn(window, 'close').mockReturnValue(undefined);

afterEach(() => {
  jest.clearAllMocks();
});

describe('TourPage', () => {
  it('renders Page component', () => {
    const wrapper = mount(<TourPage title="TITLE" tiles={[]} />);

    expect(wrapper.find(Page)).toHaveLength(1);
  });

  it('renders close button', () => {
    const wrapper = mount(
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

    expect(wrapper.find('header').find(Link)).toHaveLength(1);
    expect(wrapper.find('header').find(Link).find(CloseIcon)).toHaveLength(1);

    act(() => {
      wrapper.find('header').find(Link).find('button').simulate('click');
    });

    expect(windowCloseSpy).toHaveBeenCalled();
  });

  it('renders title', () => {
    const wrapper = mount(<TourPage title="TITLE" tiles={[]} />);

    expect(wrapper.find(Heading1).text()).toBe('TITLE');
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
