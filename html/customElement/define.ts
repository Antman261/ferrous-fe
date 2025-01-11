import { toKebabCase } from '@std/text';
import { Arrayable, CommonPrimitive } from '@ferrous/util';
import { GlobalState } from '../global/state.ts';

type Stateable = Record<string, Arrayable<CommonPrimitive>>;
type PAttrs = Record<string, CommonPrimitive>;
type Opt<S extends Stateable, A extends PAttrs> = {
  name: string;
  styles?: HTMLStyleElement[];
  localState?: S;
  publicAttrs?: A;
};
type Ret<A extends PAttrs> = {
  html: (attrs?: Partial<A>) => string;
  element: (attrs?: Partial<A>) => HTMLElement;
};
type DefineCustomElementFn = <S extends Stateable, A extends PAttrs>(
  opts: Opt<S, A>,
  initComponent: InitComponent<S, A>,
) => Ret<A>;

type InitComponent<S extends Stateable, A extends PAttrs> = (
  initOpts: InitOpts<S, A>,
) => CustomElementMethods;
type InitOpts<S extends Stateable, A extends PAttrs> = {
  local: Subscribable<S>;
  attrs: A;
  global: GlobalState;
  // enqueueUpdate: EnqueueUpdate,
};
type CustomElementMethods = {
  onAttrUpdated?: (name?: string, oldValue?: unknown, newValue?: unknown) => void;
  render: () => HTMLElement[];
  onDisconnect: () => void;
};

type Subscribable<LocalState extends Stateable, K extends keyof LocalState = keyof LocalState> =
  & LocalState
  & {
    on: (k: K, callback: (old: LocalState[K], updated: LocalState[K]) => void) => void;
  };

export const defineCustomElement: DefineCustomElementFn = <S extends Stateable, A extends PAttrs>(
  opts: Opt<S, A>,
  initComponent: InitComponent<S, A>,
): Ret<A> => {
  const name = toKebabCase(opts.name);
  let res: CustomElementMethods;
  // deno-lint-ignore no-undef
  customElements.define(
    name,
    // deno-lint-ignore no-undef
    class extends HTMLElement {
      static get observedAttributes() {
        return Object.keys(opts.publicAttrs ?? {});
      }
      constructor() {
        super();
      }
      connectedCallback() {
        console.log('element added to page.');
        const shadowRoot = this.attachShadow({ mode: 'open' });
        res = initWithContext(initComponent, { opts, shadowRoot });
        const children = res.render();
        for (const child of children) {
          shadowRoot.appendChild(child);
        }
      }

      disconnectedCallback() {
        console.log('element removed from page.');
      }

      adoptedCallback() {
        console.log('element moved to new page.');
      }

      attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
        res?.onAttrUpdated ? res?.onAttrUpdated(name, oldValue, newValue) : undefined;
      }
    },
  );
  return {
    html: (attrs?: Attrs) => `${name}${attrs ? ` ${toAttrText(attrs)}` : ''}`,
    element: (attrs?: Attrs) => document.createElement(name),
  };
};
