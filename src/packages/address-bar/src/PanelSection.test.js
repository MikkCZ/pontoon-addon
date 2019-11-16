import React from 'react';
import ReactDOM from 'react-dom';
import { PanelSection } from './PanelSection';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PanelSection />, div);
  ReactDOM.unmountComponentAtNode(div);
});
