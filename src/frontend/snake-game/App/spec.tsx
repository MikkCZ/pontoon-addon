import React from 'react';
import { mount } from 'enzyme';

import { Page } from '@frontend/commons/components/pontoon/Page';
import { Heading2 } from '@frontend/commons/components/pontoon/Heading2';
import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';

import { SnakeGameBoard } from '../SnakeGameBoard';
import { SnakeGameInfo } from '../SnakeGameInfo';

import { App } from '.';

jest.mock('@commons/webExtensionsApi');

describe('snake-game/App', () => {
  it('renders Page components', () => {
    const wrapper = mount(<App />);

    expect(wrapper.find(Page)).toHaveLength(1);
  });

  it('renders content', () => {
    const wrapper = mount(<App />);

    expect(wrapper.find(Heading2).text()).toBe(
      'Thank you for using Pontoon Add-on.',
    );
    expect(wrapper.find(Heading3).first().text()).toBe('Enjoy the game.');
    expect(wrapper.find(SnakeGameBoard)).toHaveLength(1);
    expect(wrapper.find(SnakeGameInfo)).toHaveLength(1);
  });
});
