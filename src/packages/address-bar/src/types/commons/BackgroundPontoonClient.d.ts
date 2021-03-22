declare module '@pontoon-addon/commons/src/BackgroundPontoonClient' {
  export interface Project {
    name: string;
    pageUrl: string;
    translationUrl: string;
  }

  export class BackgroundPontoonClient {
    constructor();
    async getPontoonProjectForTheCurrentTab(): Promise<Project>;
  }
}
