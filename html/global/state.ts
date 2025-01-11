import { Arrayable, CommonPrimitive } from '@ferrous/util';

type Subscribeable = {
  onUpdate: (prop: string, oldVal: CommonPrimitive, newVal: CommonPrimitive) => void;
};
export type GlobalState = {
  [key: string]: Arrayable<CommonPrimitive> | GlobalState;
} & Subscribeable;
