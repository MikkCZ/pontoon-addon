/* global browser, flushPromises */
import React from 'react';
import { mount } from 'enzyme';
import { CloseButton } from './CloseButton';

describe('<CloseButton>', () => {

  afterEach(() => {
    browser.flush();
  });

  it('takes title', () => {
    const wrapper = mount(
      <CloseButton title="TITLE" />
    );

    expect(wrapper.find('button').getDOMNode().title).toBe('TITLE');
  });

  it('has close icon', () => {
    const wrapper = mount(
      <CloseButton title="" />
    );

    expect(wrapper.find('button').getDOMNode()).toHaveStyle('background: url(glyph-dismiss-16.svg) no-repeat center');
  });

  it('closes intro page', async () => {
    const wrapper = mount(
      <CloseButton title="" />
    );

    const fakeTab = {id: 'fake-tab_id'};
    browser.tabs.query.withArgs({currentWindow: true, active: true}).resolves([fakeTab]);

    wrapper.find('button').simulate('click');
    await flushPromises();

    expect(browser.tabs.remove.withArgs(fakeTab.id).calledOnce).toBe(true);
  });

});
