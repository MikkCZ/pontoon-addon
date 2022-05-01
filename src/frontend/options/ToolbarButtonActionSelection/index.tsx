import React, { useEffect, useState, ChangeEvent } from 'react';
import styled from 'styled-components';

import { openNewTab } from '@commons/webExtensionsApi';
import { BackgroundPontoonClient } from '@background/BackgroundPontoonClient';
import { getOneOption, setOption } from '@commons/options';

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

export const ToolbarButtonActionSelection: React.FC = () => {
  const [value, setValue] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      setValue(await getOneOption('toolbar_button_action'));
    })();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setOption('toolbar_button_action', e.target.value);
  };

  return (
    <div>
      <div>When you click the toolbar button</div>
      <label>
        <input
          type="radio"
          name="toolbar_button_action"
          value="popup"
          checked={value === 'popup'}
          onChange={handleChange}
        />
        Open popup with notifications and team information
      </label>
      <label>
        <input
          type="radio"
          name="toolbar_button_action"
          value="team-page"
          checked={value === 'team-page'}
          onChange={handleChange}
        />
        Open your locale team page
      </label>
      <label>
        <input
          type="radio"
          name="toolbar_button_action"
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
            openNewTab(await backgroundPontoonClient.getSettingsUrl());
          }}
        >
          Pontoon Settings
        </Link>
        .
      </aside>
    </div>
  );
};
