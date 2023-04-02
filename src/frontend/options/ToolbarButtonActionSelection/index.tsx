import type { ChangeEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { getSettingsUrl } from '@background/backgroundClient';
import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import { openNewPontoonTab } from '@commons/utils';

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

export const ToolbarButtonActionSelection: React.FC = () => {
  const [value, setValue] = useState<OptionsContent['toolbar_button_action']>();

  useEffect(() => {
    (async () => {
      setValue(await getOneOption('toolbar_button_action'));
    })();
  }, []);

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value as OptionsContent['toolbar_button_action']);
      await setOption(
        'toolbar_button_action',
        e.target.value as OptionsContent['toolbar_button_action'],
      );
    },
    [setValue],
  );

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
            openNewPontoonTab(await getSettingsUrl());
          }}
        >
          Pontoon Settings
        </Link>
        .
      </aside>
    </div>
  );
};
