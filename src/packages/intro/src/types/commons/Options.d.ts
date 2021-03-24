declare module '@pontoon-addon/commons/src/Options' {
  export class Options {
    static async create(): Promise<Options>;
    set(id: string, value: unknown): void;
  }
}
