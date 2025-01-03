export type Primitive = null | undefined | boolean | number | string | symbol | bigint;
export const isPrimitive = (value: unknown): value is Primitive =>
  value === null || (typeof value !== 'object' && typeof value !== 'function');
