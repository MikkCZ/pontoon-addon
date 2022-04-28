import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { browser } from '@commons/webExtensionsApi';
import { GlobalPontoonStyle } from '@commons/GlobalPontoonStyle';
import { Options } from '@commons/Options';

import { Header } from '../Header';
import { LocaleSelection } from '../LocaleSelection';
import { DataIntervalUpdateSelection } from '../DataIntervalUpdateSelection';
import { Checkbox } from '../Checkbox';
import { ToolbarButtonActionSelection } from '../ToolbarButtonActionSelection';
import { ContainerSelection } from '../ContainerSelection';
import { PontoonBaseUrlInput } from '../PontoonBaseUrlInput';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: sans-serif;
    font-size: 14px;
    font-weight: 300;
  }
`;

const Content = styled.main`
  max-width: 37.5em;
  margin: 0 auto;
  line-height: 1.5em;
`;

const Heading = styled.section`
  padding: 2em;
  background-color: #333941;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 5em;

  & > div {
    margin-top: 1em;
  }

  & aside {
    margin: 0.3em 0 0 0.3em;
    font-style: italic;
    color: #888;
  }
`;

const Link = styled.button`
  appearance: none;
  display: inline-block;
  background: transparent;
  border: none;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: #7bc876;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: inherit;
  }
`;

const options = new Options();

export const App: React.FC = () => {
  return (
    <>
      <GlobalPontoonStyle />
      <GlobalStyle />
      <Header />
      <Heading>
        <h2>Pontoon Add-on</h2>
        <h2>Settings</h2>
      </Heading>
      <Content>
        <Section>
          <h3>General</h3>
          <LocaleSelection options={options} />
          <DataIntervalUpdateSelection options={options} />
        </Section>
        <Section>
          <h3>Toolbar button</h3>
          <div>
            <Checkbox
              options={options}
              optionKey="display_toolbar_button_badge"
            >
              Show the number of unread notifications in the toolbar button
            </Checkbox>
          </div>
          <ToolbarButtonActionSelection options={options} />
          <div>
            <Checkbox
              options={options}
              optionKey="toolbar_button_popup_always_hide_read_notifications"
            >
              In the popup, display unread notifications only
            </Checkbox>
            <aside>
              By default the popup always show some recent (even read)
              notifications.
            </aside>
          </div>
        </Section>
        <Section>
          <h3>System notifications</h3>
          <div>
            <Checkbox options={options} optionKey="show_notifications">
              Use system notifications to show what&apos;s new in Pontoon
            </Checkbox>
            <aside>
              See the{' '}
              <Link
                onClick={() => {
                  browser.tabs.create({
                    url: browser.runtime.getURL('frontend/intro.html'),
                  });
                }}
              >
                Tour
              </Link>{' '}
              for a preview.
            </aside>
          </div>
        </Section>
        <Section>
          <h3>Advanced</h3>
          {browser.contextualIdentities && (
            <ContainerSelection options={options} />
          )}
          <PontoonBaseUrlInput options={options} />
          <div>
            <Link
              onClick={async () => {
                if (
                  window.confirm(
                    'Do you really want to reset all Pontoon Add-on settings to default?',
                  )
                ) {
                  await options.resetDefaults();
                  window.location.reload();
                }
              }}
            >
              Reset all settings to default
            </Link>
          </div>
        </Section>
      </Content>
    </>
  );
};
