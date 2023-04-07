import React from 'react';
import { css } from '@emotion/react';

import {
  openIntro,
  openNewTab,
  openPrivacyPolicy,
  supportsContainers,
} from '@commons/webExtensionsApi';
import { resetDefaultOptions } from '@commons/options';
import { pontoonAddonWiki } from '@commons/webLinks';
import { colors } from '@frontend/commons/const';
import { Page } from '@frontend/commons/components/pontoon/Page';
import { Heading1 } from '@frontend/commons/components/pontoon/Heading1';
import { Heading3 } from '@frontend/commons/components/pontoon/Heading3';
import { Link } from '@frontend/commons/components/pontoon/Link';

import { LocaleSelection } from '../LocaleSelection';
import { DataIntervalUpdateSelection } from '../DataIntervalUpdateSelection';
import { Checkbox } from '../Checkbox';
import { ToolbarButtonActionSelection } from '../ToolbarButtonActionSelection';
import { ContainerSelection } from '../ContainerSelection';
import { PontoonBaseUrlInput } from '../PontoonBaseUrlInput';

const Content: React.FC<React.ComponentProps<'div'>> = (props) => (
  <div
    css={css({
      maxWidth: '37.5em',
      margin: '0 auto',
      lineHeight: '1.5em',
    })}
    {...props}
  />
);

const Section: React.FC<React.ComponentProps<'section'>> = (props) => (
  <section
    css={css([
      {
        marginBottom: '5em',
      },
      {
        '& > div': {
          marginTop: '1em',
        },
      },
      {
        '& aside': {
          margin: '0.3em 0 0 0.3em',
          fontStyle: 'italic',
          color: colors.font.veryLight,
        },
      },
    ])}
    {...props}
  />
);

export const App: React.FC = () => {
  return (
    <Page
      headerLinks={[
        { text: 'Tour', onClick: () => openIntro() },
        { text: 'Wiki', onClick: () => openNewTab(pontoonAddonWiki()) },
        { text: 'Privacy', onClick: () => openPrivacyPolicy() },
      ]}
      heading={
        <Heading1>
          Pontoon Add-on
          <br />
          Settings
        </Heading1>
      }
    >
      <Content>
        <Section>
          <Heading3>General</Heading3>
          <LocaleSelection />
          <DataIntervalUpdateSelection />
        </Section>
        <Section>
          <Heading3>Toolbar button</Heading3>
          <div>
            <Checkbox optionKey="display_toolbar_button_badge">
              Show the number of unread notifications in the toolbar button
            </Checkbox>
          </div>
          <ToolbarButtonActionSelection />
          <div>
            <Checkbox optionKey="toolbar_button_popup_always_hide_read_notifications">
              In the popup, display unread notifications only
            </Checkbox>
            <aside>
              By default the popup always show some recent (even read)
              notifications.
            </aside>
          </div>
        </Section>
        <Section>
          <Heading3>System notifications</Heading3>
          <div>
            <Checkbox optionKey="show_notifications">
              Use system notifications to show what&apos;s new in Pontoon
            </Checkbox>
            <aside>
              See the <Link onClick={() => openIntro()}>Tour</Link> for a
              preview.
            </aside>
          </div>
        </Section>
        <Section>
          <Heading3>Advanced</Heading3>
          {supportsContainers() && <ContainerSelection />}
          <PontoonBaseUrlInput />
          <div>
            <Link
              onClick={async () => {
                if (
                  window.confirm(
                    'Do you really want to reset all Pontoon Add-on settings to default?',
                  )
                ) {
                  await resetDefaultOptions();
                  window.location.reload();
                }
              }}
            >
              Reset all settings to default
            </Link>
          </div>
        </Section>
      </Content>
    </Page>
  );
};
