import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import type { Project } from '@background/BackgroundPontoonClient';
import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { PanelSection } from '../PanelSection';
import { PanelListItem } from '../PanelListItem';

import { AddressBarRoot } from '.';

const project: Project = {
  name: 'Some Project',
  pageUrl: 'https://127.0.0.1/pageUrl',
  translationUrl: 'https://127.0.0.1/translationUrl',
};

beforeEach(() => {
  mockBrowserNode.enable();
});

afterEach(() => {
  mockBrowserNode.verifyAndDisable();
});

describe('AddressBarRoot', () => {
  it('renders items for the project', () => {
    const wrapper = mount(<AddressBarRoot project={project} />);

    expect(wrapper.find(PanelSection)).toHaveLength(1);
    expect(wrapper.find(PanelListItem)).toHaveLength(2);
    expect(wrapper.find(PanelListItem).at(0).text()).toBe(
      `Open ${project.name} project page`,
    );
    expect(wrapper.find(PanelListItem).at(1).text()).toBe(
      `Open ${project.name} translation view`,
    );
  });

  it('handles click to open project page', () => {
    const wrapper = mount(<AddressBarRoot project={project} />);

    mockBrowser.tabs.create
      .expect({ url: project.pageUrl })
      .andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    act(() => {
      wrapper.find(PanelListItem).at(0).simulate('click');
    });

    mockBrowserNode.verify();
  });

  it('handles click to open translation view', () => {
    const wrapper = mount(<AddressBarRoot project={project} />);

    mockBrowser.tabs.create
      .expect({ url: project.translationUrl })
      .andResolve({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    act(() => {
      wrapper.find(PanelListItem).at(1).simulate('click');
    });

    mockBrowserNode.verify();
  });
});
