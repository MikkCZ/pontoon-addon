import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import * as UtilsApiModule from '@commons/utils';
import { getSignInURL } from '@background/backgroundClient';

import { NotificationsListError, SignInLink } from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const windowCloseSpy = jest.spyOn(window, 'close');
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

afterEach(() => {
  windowCloseSpy.mockReset();
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

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(signInUrl);
  });
});
