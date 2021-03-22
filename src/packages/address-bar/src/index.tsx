import React from 'react';
import ReactDOM from 'react-dom';

import { BackgroundPontoonClient } from '@pontoon-addon/commons/src/BackgroundPontoonClient';

import { AddressBarRoot } from './root/AddressBarRoot';

async function render(): Promise<void> {
  const backgroundPontoonClient = new BackgroundPontoonClient();
  const project = await backgroundPontoonClient.getPontoonProjectForTheCurrentTab();
  ReactDOM.render(
    <AddressBarRoot project={project} />,
    document.getElementById('address-bar-root')
  );
}

export default render();
