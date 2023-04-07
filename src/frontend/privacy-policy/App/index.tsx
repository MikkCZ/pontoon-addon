import React from 'react';
import { css } from '@emotion/react';

import privacyMdAsString from '@assets/PRIVACY.md';
import { Page } from '@frontend/commons/components/pontoon/Page';
import { Heading1 } from '@frontend/commons/components/pontoon/Heading1';
import { openIntro, openNewTab, openOptions } from '@commons/webExtensionsApi';
import { pontoonAddonWiki } from '@commons/webLinks';

import { MarkdownContent } from '../MarkdownContent';

export const App: React.FC = () => {
  return (
    <Page
      headerLinks={[
        { text: 'Tour', onClick: () => openIntro() },
        { text: 'Wiki', onClick: () => openNewTab(pontoonAddonWiki()) },
        { text: 'Settings', onClick: () => openOptions() },
      ]}
      heading={<Heading1>Privacy policy</Heading1>}
    >
      <MarkdownContent
        css={css({
          maxWidth: '960px',
          margin: '0 auto',
        })}
        markdownText={privacyMdAsString}
      />
    </Page>
  );
};
