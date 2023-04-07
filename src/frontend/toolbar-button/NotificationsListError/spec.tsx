import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import flushPromises from 'flush-promises';

import * as UtilsApiModule from '@commons/utils';
import { getSignInURL } from '@background/backgroundClient';

import { NotificationsListError } from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');
jest.mock('@background/backgroundClient');

const windowCloseSpy = jest.spyOn(window, 'close').mockReturnValue(undefined);
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

const signInUrl = 'https://127.0.0.1/';
(getSignInURL as jest.Mock).mockReturnValue(signInUrl);

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationsListError', () => {
  it('renders with test id', () => {
    render(<NotificationsListError />);

    expect(screen.getByTestId('notifications-list-error')).toBeInTheDocument();
  });

  it('opens sign-in page on click', async () => {
    render(<NotificationsListError />);

    expect(screen.getByRole('link')).toHaveTextContent('signed in');
    await act(async () => {
      screen.getByRole('link').click();
      await flushPromises();
    });

    expect(openNewPontoonTabSpy).toHaveBeenCalledWith(signInUrl);
    expect(windowCloseSpy).toHaveBeenCalled();
  });
});
