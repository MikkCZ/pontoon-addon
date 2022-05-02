import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import { getSignInURL } from '@background/backgroundClient';
import { openNewTab } from '@commons/webExtensionsApi';

import { NotificationsListError, SignInLink } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@background/backgroundClient');

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
  (openNewTab as jest.Mock).mockReset();
  (getSignInURL as jest.Mock).mockReset();
});

describe.skip('NotificationsListError', () => {
  it('opens sign-in page on click', async () => {
    const signInUrl = 'https://127.0.0.1/';
    (getSignInURL as jest.Mock).mockReturnValue(signInUrl);
    const wrapper = shallow(<NotificationsListError />);

    act(() => {
      wrapper.find(SignInLink).simulate('click');
    });
    await flushPromises();

    expect(openNewTab).toHaveBeenCalledWith(signInUrl);
  });
});
