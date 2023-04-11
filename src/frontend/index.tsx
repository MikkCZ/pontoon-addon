import React from 'react';
import { createRoot } from 'react-dom/client';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

import { App as AddressBarApp } from './address-bar/App';
import { App as IntroApp } from './intro/App';
import { App as OptionsApp } from './options/App';
import { App as PrivacyPolicyApp } from './privacy-policy/App';
import { App as SnakeGameApp } from './snake-game/App';
import { App as ToolbarButtonApp } from './toolbar-button/App';

function renderRoot(rootElement: HTMLElement, children: React.ReactNode) {
  createRoot(rootElement).render(
    <React.StrictMode>{children}</React.StrictMode>,
  );
}

function renderToolbarButtonApp(rootElement: HTMLElement) {
  TimeAgo.addLocale(en);
  renderRoot(rootElement, <ToolbarButtonApp />);
}

export function render() {
  const addressBarRoot = document.getElementById('address-bar-root');
  const introRoot = document.getElementById('intro-root');
  const optionsRoot = document.getElementById('options-root');
  const privacyPolicyRoot = document.getElementById('privacy-policy-root');
  const snakeGameRoot = document.getElementById('snake-game-root');
  const toolbarButtonRoot = document.getElementById('toolbar-button-root');

  addressBarRoot && renderRoot(addressBarRoot, <AddressBarApp />);
  introRoot && renderRoot(introRoot, <IntroApp />);
  optionsRoot && renderRoot(optionsRoot, <OptionsApp />);
  privacyPolicyRoot && renderRoot(privacyPolicyRoot, <PrivacyPolicyApp />);
  snakeGameRoot && renderRoot(snakeGameRoot, <SnakeGameApp />);
  toolbarButtonRoot && renderToolbarButtonApp(toolbarButtonRoot);
}

render();
