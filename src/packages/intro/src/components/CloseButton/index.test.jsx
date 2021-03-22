/* global browser, flushPromises */
import React from 'react';
import { mount } from 'enzyme';
import { CloseButton } from '.';

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

  it('calls custom onClick handler', () => {
    const onClick = jest.fn();
    const wrapper = mount(
      <CloseButton onClick={onClick} />
    );

    wrapper.find('button').simulate('click');

    expect(onClick).toHaveBeenCalled();
  });

});
