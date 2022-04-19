declare module '@pontoon-addon/commons/src/Options' {
  interface OptionsValues {
    [optionId: string]: unknown;
  }

  export class Options {
    static async create(): Promise<Options>;
    async loadAllFromLocalStorage(): Promise<void>;
    updateOptionFromInput(
      input: HTMLInputElement | HTMLSelectElement
    ): Promise<void>;
    async get(optionIds: string | string[]): Promise<OptionsValues>;
    async resetDefaults(): Promise<void>;
  }
}
