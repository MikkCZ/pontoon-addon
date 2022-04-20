import React from 'react';

// TODO: bug in ESLint?
// eslint-disable-next-line import/no-unresolved
import privacyMd from '@assets/PRIVACY.md';

import { MarkdownContent } from '../MarkdownContent';

import './index.css';

export const PrivacyPolicyRoot: React.FC = () => {
  return (
    <div className="PrivacyPolicyRoot">
      <MarkdownContent markdownFile={privacyMd} />
    </div>
  );
};
