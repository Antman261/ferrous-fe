export type Statics = TemplateStringsArray;
export type TemplateFunc<T = string, F = unknown> = (
  strings: Statics,
  ...fields: F[]
) => T;
export const getRawText: TemplateFunc = (strings, ...fields) => String.raw({ raw: strings }, ...fields);
