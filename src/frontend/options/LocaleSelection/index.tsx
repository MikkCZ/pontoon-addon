import React, { useEffect, useState } from 'react';

import { Options } from '@commons/Options';
import { getOneFromStorage } from '@commons/webExtensionsApi';
import {
  BackgroundPontoonClient,
  TeamsList,
} from '@background/BackgroundPontoonClient';

const backgroundPontoonClient = new BackgroundPontoonClient();
const OPTION_KEY = 'locale_team';

export const LocaleSelection: React.FC<{ options: Options }> = ({
  options,
}) => {
  const [teamsList, setTeamsList] = useState<TeamsList | undefined>();
  const [localeTeam, _setLocaleTeamState] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const [teamsInPontoon, localeTeamFromOptions] = await Promise.all([
        getOneFromStorage<TeamsList>('teamsList'),
        options.get(OPTION_KEY) as Promise<{ [OPTION_KEY]: string }>,
      ]);
      _setLocaleTeamState(localeTeamFromOptions[OPTION_KEY]);
      setTeamsList(teamsInPontoon);
    })();
  }, [options]);

  const setLocaleTeam = (selected?: string) => {
    _setLocaleTeamState(selected);
    options.set(OPTION_KEY, selected);
  };

  return (
    <div>
      <label htmlFor={OPTION_KEY}>Select your locale team</label>
      <select
        value={localeTeam}
        onChange={(e) => setLocaleTeam(e.target.value)}
      >
        {localeTeam &&
          teamsList &&
          Object.entries(teamsList).map(([locale, teamData]) => {
            return (
              <option
                key={locale}
                value={locale}
              >{`${teamData.name} (${locale})`}</option>
            );
          })}
      </select>{' '}
      <button
        className="pontoon-style"
        title="Sync with your Pontoon homepage preference"
        onClick={async () => {
          const previousLocaleTeam = localeTeam;
          setLocaleTeam(undefined);
          try {
            const [teamsInPontoon, localeTeamFromPontoon] = await Promise.all([
              backgroundPontoonClient.updateTeamsList(),
              backgroundPontoonClient.getTeamFromPontoon(),
            ]);
            setTeamsList(teamsInPontoon);
            setLocaleTeam(localeTeamFromPontoon || previousLocaleTeam);
          } catch (error) {
            console.error(error);
            setLocaleTeam(previousLocaleTeam);
          }
        }}
      >
        Load from Pontoon
      </button>
    </div>
  );
};
