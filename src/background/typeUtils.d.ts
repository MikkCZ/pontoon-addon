export type DeepRequired<T> = T extends object
  ? Required<{
      [P in keyof T]: DeepRequired<T[P]>;
    }>
  : Required<T>;

export type DeepNonNullable<T> = T extends object
  ? NonNullable<{
      [P in keyof T]: DeepNonNullable<T[P]>;
    }>
  : NonNullable<T>;
