import React, { useEffect, useState } from 'react';

import { getOneOption, setOption } from '@commons/options';
import type { OptionsContent } from '@commons/data/defaultOptions';

const INTERVAL_OPTIONS_MINUTES = [5, 15, 30, 60, 120];

export const DataIntervalUpdateSelection: React.FC = () => {
  const [intervalMinutes, _setIntervalMinutesState] = useState<
    OptionsContent['data_update_interval'] | undefined
  >();

  useEffect(() => {
    (async () => {
      _setIntervalMinutesState(await getOneOption('data_update_interval'));
    })();
  }, []);

  const setIntervalMinutes = (intervalMin: number) => {
    _setIntervalMinutesState(intervalMin);
    setOption('data_update_interval', intervalMin);
  };

  return (
    <div>
      <label
        htmlFor="data_update_interval"
        title="How frequently Pontoon Add-on checks for new notifications and updates your team information"
      >
        Select how frequently data should be updated from Pontoon
      </label>
      <select
        id="data_update_interval"
        value={intervalMinutes}
        onChange={(e) => setIntervalMinutes(parseInt(e.target.value, 10))}
      >
        {intervalMinutes &&
          INTERVAL_OPTIONS_MINUTES.map((intervalMinutes) => {
            return (
              <option
                key={intervalMinutes}
                value={intervalMinutes}
              >{`${intervalMinutes} min`}</option>
            );
          })}
      </select>
    </div>
  );
};
