declare module '@pontoon-addon/commons/src/Options' {
  interface OptionsValues {
    [optionId: string]: unknown;
  }

  export class Options {
    static async create(): Promise<Options>;
    async get(optionIds: string | string[]): Promise<OptionsValues>;
    subscribeToOptionChange(
      optionId: string,
      callback: (change: Storage.StorageChange) => void
    ): void;
  }
}
