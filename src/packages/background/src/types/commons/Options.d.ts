declare module '@pontoon-addon/commons/src/Options' {
  export class Options {
    static async create(): Promise<Options>;
    async get(optionIds: string | string[]): Promise<unknown>;
    subscribeToOptionChange(
      optionId: string,
      callback: (change: Storage.StorageChange) => void
    ): void;
  }
}
