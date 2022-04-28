import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import type { Project } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { PanelSection } from '../PanelSection';
import { PanelListItem } from '../PanelListItem';

import { App } from '.';

const project: Project = {
  name: 'Some Project',
  pageUrl: 'https://127.0.0.1/pageUrl',
  translationUrl: 'https://127.0.0.1/translationUrl',
};

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.runtime.sendMessage
    .expect(expect.anything())
    .andResolve(project as any); // eslint-disable-line @typescript-eslint/no-explicit-any
});

afterEach(() => {
  mockBrowserNode.verifyAndDisable();
});

describe('address-bar/App', () => {
  it('renders items for the project', async () => {
    const wrapper = mount(<App />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find(PanelSection)).toHaveLength(1);
    expect(wrapper.find(PanelListItem)).toHaveLength(2);
    expect(wrapper.find(PanelListItem).at(0).text()).toBe(
      `Open ${project.name} project page`,
    );
    expect(wrapper.find(PanelListItem).at(1).text()).toBe(
      `Open ${project.name} translation view`,
    );
  });

  it('handles click to open project page', async () => {
    const wrapper = mount(<App />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    mockBrowser.tabs.create
      .expect({ url: project.pageUrl })
      .andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    act(() => {
      wrapper.find(PanelListItem).at(0).simulate('click');
    });

    mockBrowserNode.verify();
  });

  it('handles click to open translation view', async () => {
    const wrapper = mount(<App />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    mockBrowser.tabs.create
      .expect({ url: project.translationUrl })
      .andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    act(() => {
      wrapper.find(PanelListItem).at(1).simulate('click');
    });

    mockBrowserNode.verify();
  });
});
