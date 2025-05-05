import React, { useCallback, useEffect, useState } from 'react';

import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';
import { doAsync } from '@commons/utils';
import { InputLabel } from '@frontend/commons/components/pontoon/InputLabel';
import { SelectInput } from '@frontend/commons/components/pontoon/SelectInput';

const INTERVAL_OPTIONS_MINUTES = [5, 15, 30, 60, 120];

export const DataIntervalUpdateSelection: React.FC = () => {
  const [intervalMinutes, _setIntervalMinutesState] =
    useState<OptionsContent['data_update_interval']>();

  useEffect(() => {
    doAsync(async () => {
      _setIntervalMinutesState(await getOneOption('data_update_interval'));
    });
  }, []);

  const setIntervalMinutes = useCallback(
    async (intervalMin: number) => {
      _setIntervalMinutesState(intervalMin);
      await setOption('data_update_interval', intervalMin);
    },
    [_setIntervalMinutesState],
  );

  return (
    <div>
      <InputLabel
        htmlFor="data_update_interval"
        title="How frequently Pontoon Add-on checks for new notifications and updates your team information"
      >
        Select how frequently data should be updated from Pontoon
      </InputLabel>
      <SelectInput
        id="data_update_interval"
        value={intervalMinutes}
        onChange={(e) => setIntervalMinutes(parseInt(e.target.value, 10))}
      >
        {intervalMinutes &&
          INTERVAL_OPTIONS_MINUTES.map((intervalMinutes) => (
            <option key={intervalMinutes} value={intervalMinutes}>
              {`${intervalMinutes} min`}
            </option>
          ))}
      </SelectInput>
    </div>
  );
};
