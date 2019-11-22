/* global browser, flushPromises */
import React from 'react';
import { mount } from 'enzyme';
import { CloseButton } from './CloseButton';

describe('<CloseButton>', () => {

  afterEach(() => {
    browser.flush();
  });

  it('has close icon', () => {
    const wrapper = mount(
      <CloseButton />
    );

    expect(wrapper.find('button').getDOMNode()).toHaveStyle('background: url(close-16.svg) no-repeat center');
  });

  it('uses style from props', () => {
    const wrapper = mount(
      <CloseButton style={{ border: '1px solid black' }} />
    );

    expect(wrapper.find('button').getDOMNode()).toHaveStyle('border: 1px solid black');
  });

  it('closes intro page', async () => {
    const wrapper = mount(
      <CloseButton />
    );

    const fakeTab = {id: 'fake-tab_id'};
    browser.tabs.query.withArgs({currentWindow: true, active: true}).resolves([fakeTab]);

    wrapper.find('button').simulate('click');
    await flushPromises();

    expect(browser.tabs.remove.withArgs(fakeTab.id).calledOnce).toBe(true);
  });

});
