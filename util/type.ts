export type ExtractMatchingProperties<T, V> = {
  [K in keyof T]: T[K] extends V ? T[K] : never;
};
export type Maybe<T> = T | undefined;
export type ValueOf<T> = T[keyof T];
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
// deno-lint-ignore no-explicit-any
export type TupleToUnion<T extends any[]> = T extends [infer U, ...infer Rest] ? U | TupleToUnion<Rest>
  : never;
export type TupleToEnum<T extends readonly string[]> = { [key in T[number]]: key };

export type Obj<T = unknown> = Record<string | number | symbol, T>;

export type Fn<R, A = never> = (...a: A extends unknown ? A[] : never) => R;
// deno-lint-ignore no-explicit-any
export type AnyFn = (...args: any[]) => any;
export type Px<T> = Promise<T>;
export const alphalow = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
] as const;
export type Alphalow = TupleToUnion<Writeable<typeof alphalow>>;
/**
 * https://stackoverflow.com/a/72923127/2935062
 */
export type StringOf<S, X extends string> = S extends '' ? unknown
  : S extends `${X}${infer Tail}` ? StringOf<Tail, X>
  : never;

export type DoesNotStartWith<T extends string, X extends string> = [T] extends [`${X}${string}`] ? never : T;
