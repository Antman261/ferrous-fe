import { TupleToEnum } from './type.ts';

export const makeConstEnum = <T extends string[]>(arr: T): TupleToEnum<T> =>
  arr.reduce<TupleToEnum<T>>((p, c) => {
    p[c as keyof TupleToEnum<T>] = c;
    return p;
  }, {} as TupleToEnum<T>);
