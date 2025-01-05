export type Statics = TemplateStringsArray;
export type TemplateFunc<T = string, F = unknown> = (
  strings: Statics,
  ...fields: F[]
) => T;
export const tagFnToText = (strings: Statics, ...fields: unknown[]): string =>
  String.raw({ raw: strings }, ...fields);
