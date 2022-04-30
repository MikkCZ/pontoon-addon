import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { openNewTab } from '@commons/webExtensionsApi';

import { NotificationsListError, SignInLink } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@background/BackgroundPontoonClient', () => ({
  BackgroundPontoonClient: jest.fn(() => ({
    getSignInURL: getSignInURLMock,
  })),
}));

const windowCloseSpy = jest.spyOn(window, 'close');
const getSignInURLMock = jest.fn();

afterEach(() => {
  windowCloseSpy.mockReset();
  (openNewTab as jest.Mock).mockReset();
  getSignInURLMock.mockReset();
});

describe.skip('NotificationsListError', () => {
  it('opens sign-in page on click', async () => {
    const signInUrl = 'https://127.0.0.1/';
    getSignInURLMock.mockReturnValue(signInUrl);
    const wrapper = shallow(
      <NotificationsListError
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />,
    );

    act(() => {
      wrapper.find(SignInLink).simulate('click');
    });
    await flushPromises();

    expect(openNewTab).toHaveBeenCalledWith(signInUrl);
  });
});
