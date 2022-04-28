import React, { useEffect, useState } from 'react';

import { Options } from '@commons/Options';

const INTERVAL_OPTIONS_MINUTES = [5, 15, 30, 60, 120];
const OPTION_KEY = 'data_update_interval';

export const DataIntervalUpdateSelection: React.FC<{ options: Options }> = ({
  options,
}) => {
  const [intervalMinutes, _setIntervalMinutesState] = useState<
    number | undefined
  >();

  useEffect(() => {
    (async () => {
      _setIntervalMinutesState(
        (await options.get(OPTION_KEY))[OPTION_KEY] as number,
      );
    })();
  }, [options]);

  const setIntervalMinutes = (intervalMin: number) => {
    _setIntervalMinutesState(intervalMin);
    options.set(OPTION_KEY, intervalMin);
  };

  return (
    <div>
      <label
        htmlFor={OPTION_KEY}
        title="How frequently Pontoon Add-on checks for new notifications and updates your team information"
      >
        Select how frequently data should be updated from Pontoon
      </label>
      <select
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
