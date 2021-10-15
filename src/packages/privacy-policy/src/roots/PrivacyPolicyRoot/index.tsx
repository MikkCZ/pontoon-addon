import React from 'react';
import privacyMd from '@assets/PRIVACY.md';

import { MarkdownContent } from '../../components/MarkdownContent';

import './index.css';

export const PrivacyPolicyRoot: React.FC = () => {
  return (
    <div className="PrivacyPolicyRoot">
      <MarkdownContent markdownFile={privacyMd} />
    </div>
  );
};
