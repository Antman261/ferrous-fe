/**
 * rendering is always synchronous, so we can maintain context during rendering without anything fancy.
 *
 * This context is required for renderers to ensure they lookup the correct objects for comparison and update
 */
import { AnyFn, Maybe, Obj } from '@ferrous/util';

type Context = Map<Ref, ContextTuple>; // for render funcs to find their tree
type Ref = Obj | AnyFn;
type ContextTuple = [AnyFn[], number];

const objCtx: Context = new Map();

let activeCtx: Maybe<ContextTuple>;

export type CtxArgs = { obj?: Obj; fn?: AnyFn };

export const getActiveContext = ({ obj, fn }: CtxArgs = {}): ContextTuple => {
  const ref = obj ?? fn;
  if (!activeCtx && ref) activeCtx = getOrInitContext(ref);
  if (activeCtx) return activeCtx;
  throw new Error('No active context: unable to init new context without context reference.');
};

type FnIdentity = { identity: `${string}:${number}` };
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

const getOrInitContext = (ref: Ref): Maybe<ContextTuple> => objCtx.get(ref) ?? initCtx(ref);

const initCtx = (ref: Ref): Maybe<ContextTuple> => objCtx.set(ref, initCtxTuple()).get(ref);

const initCtxTuple = (): ContextTuple => [[], randomId()];

const randomId = () => Math.random() * 1_000_000_000_000; // not great, but it will work for most DOMs
