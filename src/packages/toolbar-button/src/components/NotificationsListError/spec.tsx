import React from 'react';
import { shallow } from 'enzyme';
import flushPromises from 'flush-promises';
import { act } from 'react-dom/test-utils';
import type { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { mockBrowser, mockBrowserNode } from '../../test/mockWebExtensionsApi';

import { NotificationsListError } from '.';

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

xdescribe('NotificationsListError', () => {
  it('opens sign-in page on click', async () => {
    const signInUrl = 'https://127.0.0.1/';

    const backgroundPontoonClientMock = {
      getSignInURL: async () => signInUrl,
    } as unknown as BackgroundPontoonClient;
    mockBrowser.tabs.create.expect({ url: signInUrl }).andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListError
        backgroundPontoonClient={backgroundPontoonClientMock}
      />
    );

    act(() => {
      wrapper.find('.NotificationsListError-sign-in').simulate('click');
    });
    flushPromises();

    mockBrowserNode.verify();
  });
});
