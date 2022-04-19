declare module '@pontoon-addon/commons/src/BackgroundPontoonClient' {
  interface Team {
    name: string;
  }

  export interface TeamsList {
    [slug: string]: Team;
  }

  export interface TeamsListInStorage {
    teamsList: TeamsList;
  }

  export class BackgroundPontoonClient {
    constructor();
    async getSettingsUrl(): Promise<string>;
    async updateTeamsList(): Promise<TeamsList>;
    async getTeamFromPontoon(): Promise<string>;
  }
}
