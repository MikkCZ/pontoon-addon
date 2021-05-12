import React from 'react';
import ReactDOM from 'react-dom';

import { PrivacyPolicyRoot } from './roots/PrivacyPolicyRoot';
import '@pontoon-addon/commons/static/css/pontoon.css';
import './index.css';

ReactDOM.render(
  <PrivacyPolicyRoot />,
  document.getElementById('privacy-policy-root')
);
