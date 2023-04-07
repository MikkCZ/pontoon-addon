import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import flushPromises from 'flush-promises';

import * as UtilsApiModule from '@commons/utils';
import { getTeamProjectUrl } from '@background/backgroundClient';

import { NotificationsListItem } from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

jest.spyOn(window, 'close').mockReturnValue(undefined);
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

(getTeamProjectUrl as jest.Mock).mockImplementation(
  (projectUrl: string) => projectUrl,
);

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationsListItem', () => {
  it('renders', () => {
    render(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{ safe: true, content: 'DESCRIPTION' }}
      />,
    );

    expect(screen.getByTestId('actor')).toHaveTextContent('ACTOR');
    expect(screen.getByTestId('target')).toHaveTextContent('TARGET');
    expect(screen.getByTestId('verb')).toHaveTextContent('VERB');
    expect(screen.getByTestId('timeago')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toHaveTextContent('DESCRIPTION');
  });

  it('renders links and formatting tags in description', () => {
    render(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: true,
          content:
            'DESCRIPTION <em>WITH A</em> <a href="https://example.com/">LINK</a>',
        }}
      />,
    );

    const description = screen.getByTestId('description');
    expect(description).toContainHTML('<em>WITH A</em>');
    expect(within(description).getByRole('link')).toHaveTextContent('LINK');
    expect(within(description).getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com/',
    );
  });

  it('linkifies URL in unsafe description', () => {
    render(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: false,
          content: 'DESCRIPTION WITH A LINK TO https://example.com/',
        }}
      />,
    );

    const description = screen.getByTestId('description');
    expect(within(description).getByRole('link')).toHaveTextContent(
      'https://example.com/',
    );
    expect(within(description).getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com/',
    );
  });

  it('prevents XSS in description', () => {
    render(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ anchor: 'ACTOR', url: '' }}
        verb="VERB"
        target={{ anchor: 'TARGET', url: '' }}
        date_iso="1970-01-01T00:00:00Z"
        description={{
          safe: true,
          content:
            'DESCRIPTION WITH(OUT) <a onload=alert("XSS")>XSS ATTEMPTS</a> <script>alert("XSS");</script>',
        }}
      />,
    );

    const description = screen.getByTestId('description');
    // eslint-disable-next-line testing-library/no-node-access
    expect(description.getElementsByTagName('script')).toHaveLength(0);
    expect(description.innerHTML).toBe(
      'DESCRIPTION WITH(OUT) <a>XSS ATTEMPTS</a> ',
    );
  });

  it('actor and target links work', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    const targetUrl = 'https://127.0.0.1/target/';
    render(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
        target={{ url: targetUrl, anchor: 'TARGET' }}
      />,
    );

    await act(async () => {
      screen.getByTestId('actor').click();
      await flushPromises();
    });
    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(1);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(actorUrl);

    await act(async () => {
      screen.getByTestId('target').click();
      await flushPromises();
    });
    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(2);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(targetUrl);
  });

  it('whole item is clickable when only one link is present', async () => {
    const actorUrl = 'https://127.0.0.1/actor/';
    render(
      <NotificationsListItem
        pontoonBaseUrl="https://127.0.0.1"
        unread={true}
        actor={{ url: actorUrl, anchor: 'ACTOR' }}
      />,
    );

    await act(async () => {
      screen.getByRole('listitem').click();
      await flushPromises();
    });

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(actorUrl);
  });
});
