import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { mockBrowser, mockBrowserNode } from '../../test/mockWebExtensionsApi';

import { NotificationsListError } from '.';

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('NotificationsListError', () => {
  it('opens sign-in page on click', () => {
    const signInUrl = 'https://127.0.0.1/';
    mockBrowser.runtime.sendMessage
      .expect(expect.anything())
      .andResolve(signInUrl as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockBrowser.tabs.create.expect({ url: signInUrl }).andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const wrapper = shallow(
      <NotificationsListError
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    act(() => {
      wrapper.find('.NotificationsListError-sign-in').simulate('click');
    });

    mockBrowserNode.verify();
  });
});
