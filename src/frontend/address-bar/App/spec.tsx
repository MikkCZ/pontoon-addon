import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import {
  getPontoonProjectForTheCurrentTab,
  ProjectForCurrentTab,
} from '@background/backgroundClient';
import { openNewTab } from '@commons/webExtensionsApi';

import { PanelSection } from '../PanelSection';
import { PanelListItem } from '../PanelListItem';

import { App } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@background/backgroundClient');

const project: ProjectForCurrentTab = {
  name: 'Some Project',
  pageUrl: 'https://127.0.0.1/pageUrl',
  translationUrl: 'https://127.0.0.1/translationUrl',
};

beforeEach(() => {
  (getPontoonProjectForTheCurrentTab as jest.Mock).mockReturnValue(project);
});

afterEach(() => {
  (openNewTab as jest.Mock).mockReset();
  (getPontoonProjectForTheCurrentTab as jest.Mock).mockReset();
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

    act(() => {
      wrapper.find(PanelListItem).at(0).simulate('click');
    });
    await flushPromises();

    expect(openNewTab).toHaveBeenCalledWith(project.pageUrl);
  });

  it('handles click to open translation view', async () => {
    const wrapper = mount(<App />);
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    act(() => {
      wrapper.find(PanelListItem).at(1).simulate('click');
    });
    await flushPromises();

    expect(openNewTab).toHaveBeenCalledWith(project.translationUrl);
  });
});
