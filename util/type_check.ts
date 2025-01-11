export type Primitive = null | undefined | boolean | number | string | symbol | bigint;
export type DefinedPrimitive = boolean | number | string | symbol | bigint;
export type CommonPrimitive = boolean | number | string | bigint;
export type Arrayable<T> = T extends CommonPrimitive ? Array<T> | T : never;
export const isPrimitive = (value: unknown): value is Primitive =>
  value === null || (typeof value !== 'object' && typeof value !== 'function');
export const isDefinedPrimitive = (value: unknown): value is DefinedPrimitive =>
  value === null || (typeof value !== 'object' && typeof value !== 'function');
