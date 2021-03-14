/* global browser, flushPromises */
import React from 'react';
import { shallow } from 'enzyme';
import { NotificationsListError } from '.';
import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

describe('<NotificationsListError>', () => {

  afterEach(() => {
    browser.flush();
  });

  it('opens sign-in page on click', async () => {
    const signInUrl = 'https://127.0.0.1/';
    browser.runtime.sendMessage.resolves(signInUrl);
    browser.tabs.create.resolves(undefined);

    const wrapper = shallow(
      <NotificationsListError backgroundPontoonClient={new BackgroundPontoonClient()} />
    );

    wrapper.find('.NotificationsListError-sign-in').simulate('click');
    await flushPromises();

    expect(browser.tabs.create.withArgs({url: signInUrl}).calledOnce).toBe(true);
  });

});
