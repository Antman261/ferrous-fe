import { Arrayable, CommonPrimitive } from '@ferrous/util';

export type Stateable = Record<string, Arrayable<CommonPrimitive>>;

export type GlobalState<S extends Stateable = Stateable, K extends keyof S = keyof S> = {
  [key: string]: Arrayable<CommonPrimitive> | GlobalState<Stateable>;
} & {
  notify: (k: K, callback: (old: S[K], updated: S[K]) => void) => void;
};
