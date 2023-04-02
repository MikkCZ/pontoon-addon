import React from 'react';
import ReactDOM from 'react-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { App as AddressBarApp } from './address-bar/App';
import { App as IntroApp } from './intro/App';
import { App as OptionsApp } from './options/App';
import { App as PrivacyPolicyApp } from './privacy-policy/App';
import { App as SnakeGameApp } from './snake-game/App';
import { App as ToolbarButtonApp } from './toolbar-button/App';

function renderToolbarButtonApp(rootElement: HTMLElement) {
  TimeAgo.addLocale(en);
  ReactDOM.render(<ToolbarButtonApp />, rootElement);
}

export async function render(): Promise<void> {
  const addressBarRoot = document.getElementById('address-bar-root');
  const introRoot = document.getElementById('intro-root');
  const optionsRoot = document.getElementById('options-root');
  const privacyPolicyRoot = document.getElementById('privacy-policy-root');
  const snakeGameRoot = document.getElementById('snake-game-root');
  const toolbarButtonRoot = document.getElementById('toolbar-button-root');

  addressBarRoot && ReactDOM.render(<AddressBarApp />, addressBarRoot);
  introRoot && ReactDOM.render(<IntroApp />, introRoot);
  optionsRoot && ReactDOM.render(<OptionsApp />, optionsRoot);
  privacyPolicyRoot && ReactDOM.render(<PrivacyPolicyApp />, privacyPolicyRoot);
  snakeGameRoot && ReactDOM.render(<SnakeGameApp />, snakeGameRoot);
  toolbarButtonRoot && renderToolbarButtonApp(toolbarButtonRoot);
}

render();
