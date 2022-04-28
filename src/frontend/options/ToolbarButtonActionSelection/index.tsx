import React, { useEffect, useState, ChangeEvent } from 'react';
import styled from 'styled-components';

import { browser } from '@commons/webExtensionsApi';
import { Options } from '@commons/Options';
import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';

const OPTION_KEY = 'toolbar_button_action';

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

const backgroundPontoonClient = new BackgroundPontoonClient();

export const ToolbarButtonActionSelection: React.FC<{ options: Options }> = ({
  options,
}) => {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      setValue((await options.get(OPTION_KEY))[OPTION_KEY] as string);
    })();
  }, [options]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    options.set(OPTION_KEY, e.target.value);
  };

  return (
    <div>
      <div>When you click the toolbar button</div>
      <label>
        <input
          type="radio"
          name={OPTION_KEY}
          value="popup"
          checked={value === 'popup'}
          onChange={handleChange}
        />
        Open popup with notifications and team information
      </label>
      <label>
        <input
          type="radio"
          name={OPTION_KEY}
          value="team-page"
          checked={value === 'team-page'}
          onChange={handleChange}
        />
        Open your locale team page
      </label>
      <label>
        <input
          type="radio"
          name={OPTION_KEY}
          value="home-page"
          checked={value === 'home-page'}
          onChange={handleChange}
        />
        Open your Pontoon homepage
      </label>
      <aside>
        You can set your Pontoon homepage in{' '}
        <Link
          onClick={async () => {
            browser.tabs.create({
              url: await backgroundPontoonClient.getSettingsUrl(),
            });
          }}
        >
          Pontoon Settings
        </Link>
        .
      </aside>
    </div>
  );
};
