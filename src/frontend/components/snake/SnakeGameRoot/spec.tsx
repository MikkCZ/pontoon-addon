import React from 'react';
import { mount } from 'enzyme';

import {
  mockBrowser,
  mockBrowserNode,
} from '@commons/test/mockWebExtensionsApi';

import { SnakeGameBoard } from '../SnakeGameBoard';
import { SnakeGameInfo } from '../SnakeGameInfo';

import { SnakeGameRoot } from '.';

beforeEach(() => {
  mockBrowserNode.enable();
  mockBrowser.runtime.getURL
    .expect(expect.anything())
    .andReturn('moz-extension://foo-bar');
});

afterEach(() => {
  mockBrowserNode.disable();
});

describe('SnakeGameRoot', () => {
  it('renders content', () => {
    const wrapper = mount(<SnakeGameRoot />);

    expect(wrapper.find('h2').text()).toBe(
      'Thank you for using Pontoon Add-on.'
    );
    expect(wrapper.find('h3').first().text()).toBe('Enjoy the game.');
    expect(wrapper.find(SnakeGameBoard)).toHaveLength(1);
    expect(wrapper.find(SnakeGameInfo)).toHaveLength(1);
  });
});
