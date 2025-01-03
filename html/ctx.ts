/**
 * rendering is always synchronous, so we can maintain context during rendering without anything fancy.
 *
 * This context is required for renderers to ensure they lookup the correct objects for comparison and update
 */
import { AnyFn, Obj } from '../util/type.ts';

type ComponentContextTuple = [AnyFn[], number];
type ComponentContext = Map<Obj, ComponentContextTuple>; // required for render funcs to find their tree
type ElementContextTuple = [AnyFn[], string];
type FnIdentity = { identity: `${string}:${number}` };
type CtxArgs = { obj?: Obj; fn?: AnyFn };

const objCtx: ComponentContext = new Map();

let activeComponentCtx: ComponentContextTuple | undefined;
let activeElementCtx: ElementContextTuple | undefined;
export const getActiveContext = ({ obj, fn }: CtxArgs = {}): ComponentContextTuple | ElementContextTuple => {
  if (!activeComponentCtx && obj) {
    activeComponentCtx = objCtx.get(obj) ?? objCtx.set(obj, [[], randomId()]).get(obj)!;
  }

  if (activeComponentCtx) {
    return activeComponentCtx;
  }
  if (!activeElementCtx && fn) {
    activeElementCtx = [[], fn.name];
  }
  if (activeElementCtx) {
    return activeElementCtx;
  }
  throw new Error('No active context, and no obj or fn provided to activate new context');
};
export const withObjectContext = <T extends AnyFn>(fn: T, identity?: CtxArgs): T => {
  // @ts-expect-error 2322
  const finalFn: T & FnIdentity = (...args) => {
    const [ctx, ctxId] = getActiveContext(identity);
    ctx.push(fn);
    finalFn.identity = `${ctxId}:${ctx.length}`;
    const res = fn(...args);
    ctx.pop();
    return res;
  };
  return finalFn;
};

const randomId = () => Math.random() * 1_000_000_000_000; // not great, but it will work for most DOMs
