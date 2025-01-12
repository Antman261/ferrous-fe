import { Attributes } from '../attrs.ts';
import { enqueueUpdate } from '../global/renderer.ts';
import { GlobalState, Stateable } from '../global/state.ts';
import { Part } from '../parse/constants.ts';
import { makeComponentContext } from './componentContext.ts';
import { withContext } from './ctx.ts';
import { CustomElementOpt } from './types.ts';

export type InitComponent<S extends Stateable> = (
  initOpts: InitOpts<S>,
) => CustomElementMethods;
type InitOpts<S extends Stateable> = {
  local: S;
  attrs: Attributes;
  global: GlobalState;
  // enqueueUpdate: EnqueueUpdate, // if users need enqueueUpdate then isn't something wrong with the architecture?
};

export type CustomElementMethods = {
  render(): HTMLElement[];
  onDisconnect(): void;
  onAttrUpdated(): void;
};

export type ContextualComponent = {
  render(): void;
  onDisconnect(): void;
  updateAttributes(name: string, oldValue: string | null, newValue: string | null): void;
};

type Opts<S extends Stateable> = { opts: CustomElementOpt<S, Attributes>; shadowRoot: ShadowRoot };

export const initWithContext = <S extends Stateable>(
  initComponent: InitComponent<S>,
  { opts, shadowRoot }: Opts<S>,
): ContextualComponent => {
  const ctx = makeComponentContext(opts, shadowRoot);
  const attrs = structuredClone(opts.publicAttrs) ?? {};

  const local: S = new Proxy(structuredClone(opts.localState ?? {} as S), {
    set(target, prop, newValue) {
      const didSet = Reflect.set(target, prop, newValue);
      if (typeof prop !== 'symbol') {
        if (target[prop] !== newValue) enqueueUpdate(ctxAwareRender);
      }
      return didSet;
    },
  });

  const global = getCtxBoundGlobalState(ctx);
  const component = withContext(() => initComponent({ local, attrs, global }), ctx)();

  const ctxAwareRender = withContext(component.render, ctx);
  const children = ctxAwareRender();

  return {
    render() {
      enqueueUpdate(ctxAwareRender);
    },
    updateAttributes(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        attrs[name] = newValue;
        component.onAttrUpdated();
        enqueueUpdate(ctxAwareRender);
      }
    },
    onDisconnect() {
      global.disconnectComponent();
    },
  };
};
