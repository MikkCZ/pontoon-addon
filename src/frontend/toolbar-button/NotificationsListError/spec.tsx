import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import type { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { NotificationsListError, SignInLink } from '.';

const windowCloseSpy = jest.spyOn(window, 'close');

afterEach(() => {
  windowCloseSpy.mockReset();
});

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe.skip('NotificationsListError', () => {
  it('opens sign-in page on click', async () => {
    const signInUrl = 'https://127.0.0.1/';

    const backgroundPontoonClientMock = {
      getSignInURL: async () => signInUrl,
    } as unknown as BackgroundPontoonClient;
    mockBrowser.tabs.create.expect({ url: signInUrl }).andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListError
        backgroundPontoonClient={backgroundPontoonClientMock}
      />,
    );

    act(() => {
      wrapper.find(SignInLink).simulate('click');
    });
    flushPromises();

    mockBrowserNode.verify();
  });
});
