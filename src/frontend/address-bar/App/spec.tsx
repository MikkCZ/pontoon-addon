import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import { getPontoonProjectForTheCurrentTab } from '@background/backgroundClient';
import { getOneFromStorage, openNewTab } from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import {
  pontoonProjectTranslationView,
  pontoonTeamsProject,
} from '@commons/webLinks';

import { PanelSection } from '../PanelSection';
import { PanelListItem } from '../PanelListItem';

import { App } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const project = {
  name: 'Some Project',
  slug: 'some-project',
};

const team = {
  code: 'cs',
  name: 'Czech',
};

beforeEach(() => {
  (getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(project);
  (getOneFromStorage as jest.Mock).mockResolvedValue({ [team.code]: team });
  (getOptions as jest.Mock).mockResolvedValue({
    locale_team: team.code,
    pontoon_base_url: 'https://localhost',
  });
});

afterEach(() => {
  jest.resetAllMocks();
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
      'Open Some Project dashboard for Czech',
    );
    expect(wrapper.find(PanelListItem).at(1).text()).toBe(
      'Open Some Project translation view for Czech',
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

    expect(openNewTab).toHaveBeenCalledWith(
      pontoonTeamsProject('https://localhost', { code: 'cs' }, project),
    );
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

    expect(openNewTab).toHaveBeenCalledWith(
      pontoonProjectTranslationView(
        'https://localhost',
        { code: 'cs' },
        project,
      ),
    );
  });
});
