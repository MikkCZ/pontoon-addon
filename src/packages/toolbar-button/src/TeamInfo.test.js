/* global browser, flushPromises */
import React from 'react';
import ReactTimeAgo from 'react-time-ago';
import { mount } from 'enzyme';
import { TeamInfo } from './TeamInfo';
import { TeamInfoListItem } from './TeamInfoListItem';
import { BottomLink } from './BottomLink';
import { BackgroundPontoonClient } from 'Commons/src/BackgroundPontoonClient';
import { BackgroundPontoonMessageType } from 'Commons/src/BackgroundPontoonMessageType';

describe('<TeamInfo>', () => {

  afterEach(() => {
    browser.flush();
  });

  it('renders', () => {
    const wrapper = mount(
      <TeamInfo
        name="Czech"
        code="cs"
        latestActivity={{
          user: 'USER',
          date_iso: '1970-01-01T00:00:00Z',
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find('.TeamInfo-name').text()).toBe('Czech');
    expect(wrapper.find('.TeamInfo-code').text()).toBe('cs');
    expect(wrapper.find(TeamInfoListItem).length).toBe(8);
    expect(wrapper.find(TeamInfoListItem).at(0).prop('label')).toBe('Activity');
    expect(wrapper.find(ReactTimeAgo).length).toBe(1);
    expect(wrapper.find(TeamInfoListItem).at(1).prop('label')).toBe('translated');
    expect(wrapper.find(TeamInfoListItem).at(2).prop('label')).toBe('fuzzy');
    expect(wrapper.find(TeamInfoListItem).at(3).prop('label')).toBe('warnings');
    expect(wrapper.find(TeamInfoListItem).at(4).prop('label')).toBe('errors');
    expect(wrapper.find(TeamInfoListItem).at(5).prop('label')).toBe('missing');
    expect(wrapper.find(TeamInfoListItem).at(6).prop('label')).toBe('unreviewed');
    expect(wrapper.find(TeamInfoListItem).at(7).prop('label')).toBe('all strings');
    expect(wrapper.find(BottomLink).hasClass('TeamInfo-team-page')).toBe(true);
  });

  it('renders without activity', () => {
    const wrapper = mount(
      <TeamInfo
        name="Czech"
        code="cs"
        latestActivity={{
          user: '',
          date_iso: undefined,
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    expect(wrapper.find(TeamInfoListItem).at(0).prop('label')).toBe('Activity');
    expect(wrapper.find(TeamInfoListItem).at(0).prop('value')).toBe('―');
  });

  it('all links work', async () => {
    browser.runtime.sendMessage.withArgs({type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_TEAM_PAGE_URL})
      .resolves('https://127.0.0.1/');
    ['translated', 'fuzzy', 'warnings', 'errors', 'missing', 'unreviewed', 'all'].forEach(
      (status) => browser.runtime.sendMessage.withArgs({
        type: BackgroundPontoonMessageType.TO_BACKGROUND.GET_STRINGS_WITH_STATUS_SEARCH_URL,
        args: [status],
      }).resolves(`https://127.0.0.1/${status}/`)
    );
    browser.tabs.create.resolves(undefined);

    const wrapper = mount(
      <TeamInfo
        stringsData={{
          approvedStrings: 0,
          fuzzyStrings: 0,
          stringsWithWarnings: 0,
          stringsWithErrors: 0,
          missingStrings: 0,
          unreviewedStrings: 0,
          totalStrings: 0,
        }}
        latestActivity={{
          user: 'USER',
          date_iso: '1970-01-01T00:00:00Z',
        }}
        backgroundPontoonClient={new BackgroundPontoonClient()}
      />
    );

    wrapper.find('.TeamInfo-name').simulate('click');
    wrapper.find('.TeamInfo-code').simulate('click');
    wrapper.find(BottomLink).simulate('click');
    await flushPromises();
    expect(browser.tabs.create.withArgs({url: 'https://127.0.0.1/'}).callCount).toBe(3);

    wrapper.find(TeamInfoListItem).at(1).prop('onClick')();
    wrapper.find(TeamInfoListItem).at(2).prop('onClick')();
    wrapper.find(TeamInfoListItem).at(3).prop('onClick')();
    wrapper.find(TeamInfoListItem).at(4).prop('onClick')();
    wrapper.find(TeamInfoListItem).at(5).prop('onClick')();
    wrapper.find(TeamInfoListItem).at(6).prop('onClick')();
    wrapper.find(TeamInfoListItem).at(7).prop('onClick')();
    await flushPromises();
    expect(browser.tabs.create.withArgs({url: 'https://127.0.0.1/translated/'}).calledOnce).toBe(true);
    ['translated', 'fuzzy', 'warnings', 'errors', 'missing', 'unreviewed', 'all'].forEach(
      (status) => expect(browser.tabs.create.withArgs({url: `https://127.0.0.1/${status}/`}).calledOnce).toBe(true)
    );
  });

});
