import React from 'react';
import { mount } from 'enzyme';

import { SnakeGameBoard } from '../SnakeGameBoard';
import { SnakeGameInfo } from '../SnakeGameInfo';

import { App } from '.';

jest.mock('@commons/webExtensionsApi');

describe('snake-game/App', () => {
  it('renders content', () => {
    const wrapper = mount(<App />);

    expect(wrapper.find('h2').text()).toBe(
      'Thank you for using Pontoon Add-on.',
    );
    expect(wrapper.find('h3').first().text()).toBe('Enjoy the game.');
    expect(wrapper.find(SnakeGameBoard)).toHaveLength(1);
    expect(wrapper.find(SnakeGameInfo)).toHaveLength(1);
  });
});
