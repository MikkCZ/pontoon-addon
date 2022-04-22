import React from 'react';

// TODO: bug in ESLint?
// eslint-disable-next-line import/no-unresolved
import privacyMd from '@assets/PRIVACY.md';

import { MarkdownContent } from '../MarkdownContent';

import '@commons/pontoon.css';
import './index.css';

export const App: React.FC = () => {
  return (
    <div className="PrivacyPolicyApp">
      <MarkdownContent markdownFile={privacyMd} />
    </div>
  );
};
