import React, { useEffect, useState } from 'react';

import { getOneFromStorage } from '@commons/webExtensionsApi';
import {
  BackgroundPontoonClient,
  TeamsList,
} from '@background/BackgroundPontoonClient';
import { getOneOption, setOption } from '@commons/options';

const backgroundPontoonClient = new BackgroundPontoonClient();

export const LocaleSelection: React.FC = () => {
  const [teamsList, setTeamsList] = useState<TeamsList | undefined>();
  const [localeTeam, _setLocaleTeamState] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const [teamsInPontoon, teamCode] = await Promise.all([
        getOneFromStorage('teamsList'),
        getOneOption('locale_team'),
      ]);
      _setLocaleTeamState(teamCode);
      setTeamsList(teamsInPontoon);
    })();
  }, []);

  const setLocaleTeam = (selected?: string) => {
    _setLocaleTeamState(selected);
    if (selected) {
      setOption('locale_team', selected);
    }
  };

  return (
    <div>
      <label htmlFor="locale_team">Select your locale team</label>
      <select
        id="locale_team"
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
