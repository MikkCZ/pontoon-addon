import type { ChangeEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';

import { getSettingsUrl } from '@commons/backgroundMessaging';
import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import { openNewPontoonTab } from '@commons/utils';
import { Link } from '@frontend/commons/components/pontoon/Link';
import { InputLabel } from '@frontend/commons/components/pontoon/InputLabel';
import { RadioInput } from '@frontend/commons/components/pontoon/RadioInput';

const options: {
  [key in OptionsContent['toolbar_button_action']]: {
    label: React.ComponentProps<'label'>['children'];
  };
} = {
  popup: {
    label: 'Open popup with notifications and team information',
  },
  'team-page': {
    label: 'Open your locale team page',
  },
};

export const ToolbarButtonActionSelection: React.FC = () => {
  const [selectedValue, setSelectedValue] =
    useState<OptionsContent['toolbar_button_action']>();

  useEffect(() => {
    (async () => {
      setSelectedValue(await getOneOption('toolbar_button_action'));
    })();
  }, []);

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedValue(
        e.target.value as OptionsContent['toolbar_button_action'],
      );
      await setOption(
        'toolbar_button_action',
        e.target.value as OptionsContent['toolbar_button_action'],
      );
    },
    [setSelectedValue],
  );

  return (
    <div>
      <div>When you click the toolbar button</div>
      {Object.entries(options).map(([value, { label }]) => (
        <InputLabel key={value}>
          <RadioInput
            name="toolbar_button_action"
            value={value}
            checked={selectedValue === value}
            onChange={handleChange}
          />
          {label}
        </InputLabel>
      ))}
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
