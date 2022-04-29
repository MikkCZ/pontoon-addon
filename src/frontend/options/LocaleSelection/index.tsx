import React, { useEffect, useState } from 'react';

import { Options } from '@commons/Options';
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
      Promise.all([
        backgroundPontoonClient.getTeamsList(),
        options.get(OPTION_KEY) as Promise<{ [OPTION_KEY]: string }>,
      ]).then(([teamsInPontoon, localeTeamFromOptions]) => {
        _setLocaleTeamState(localeTeamFromOptions[OPTION_KEY]);
        setTeamsList(teamsInPontoon);
      });
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
        onClick={() => {
          const previousLocaleTeam = localeTeam;
          setLocaleTeam(undefined);
          Promise.all([
            backgroundPontoonClient.updateTeamsList(),
            backgroundPontoonClient.getTeamFromPontoon(),
          ])
            .then(([teamsInPontoon, localeTeamFromPontoon]) => {
              setLocaleTeam(localeTeamFromPontoon || previousLocaleTeam);
              setTeamsList(teamsInPontoon);
            })
            .catch((error) => {
              console.error(error);
              setLocaleTeam(previousLocaleTeam);
            });
        }}
      >
        Load from Pontoon
      </button>
    </div>
  );
};
