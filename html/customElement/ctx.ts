/**
 * The original context implementation seemed overly complicated.
 * This is an implementation designed for the needs of custom components
 */

import { AnyFn } from '@ferrous/util';

// type Context = Record<string, unknown>;
type Context = unknown;
const contextStack: Context[] = [];

export const setContext = (ctx: Context): void => {
  contextStack.push(ctx);
};
export const releaseContext = (): void => {
  contextStack.pop();
};

export const getContext = <T>(): T => contextStack.at(-1) as T;

export const withContext = <T extends AnyFn>(fn: T, ctx?: Context): T => {
  // @ts-expect-error 2322
  const wrapped: T = (...args) => {
    setContext(ctx);
    const res = fn(...args);
    releaseContext();
    return res;
  };
  Object.defineProperty(wrapped, 'name', { value: fn.name });
  return wrapped;
};
