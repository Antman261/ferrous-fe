import { Attributes } from '../attrs.ts';
import { Stateable } from '../global/state.ts';

export type CustomElementOpt<S extends Stateable, A extends Attributes> = {
  name: string;
  styles?: HTMLStyleElement[];
  localState?: S;
  publicAttrs?: A;
};
