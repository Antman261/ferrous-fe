import { toKebabCase } from '@std/text';
import { ArraysOf, CommonPrimitive } from '@ferrous/util';

type Stateable = Record<string, ArraysOf<CommonPrimitive>>;

type DefineCustomElementFn = <
  LocalState extends Stateable,
  PublicAttrs extends Record<string, CommonPrimitive>,
    >( opts: {
  name: string;
  styles?: HTMLStyleElement[];
  localState?: LocalState;
  publicAttrs?: PublicAttrs;
        },
        initComponent: (initOpts: {
    state: Subscribable<LocalState>,
    attrs: PublicAttrs,
    app: FeApp,
    // enqueueUpdate: EnqueueUpdate,
        }) => CustomElementMethods) => {
        html: (attrs?: Partial<PublicAttrs>) => string;
        element: (attrs?: Partial<PublicAttrs>) => HTMLElement; 
        }

type CustomElementMethods = {
    onAttrUpdated?: (name?: string, oldValue?: unknown, newValue?: unknown) => void; 
    render: () => HTMLElement[];
    onDisconnect: () => void;
}

type Subscribable<LocalState extends Stateable, K extends keyof LocalState = keyof LocalState> = LocalState & {
    on: (k: K, callback: (old: LocalState[K], updated: LocalState[K]) => void) => void;
}
    
export const defineCustomElement: DefineCustomElementFn =
(opts, initComponent) => {
    const name = toKebabCase(opts.name);

    // TODO template fn: statics.length > 1 ? each field becomes a tracked object and associated with a parent (strings become FeXT), on subsequent re-renders all elements are re-evaluated and directly updated.
    // deno-lint-ignore no-undef
    customElements.define(
      name,
      // deno-lint-ignore no-undef
      class extends HTMLElement {
        static get observedAttributes() {
          return opts?.publicAttrs ?? [];
        }
        constructor() {
          super();
        }
        connectedCallback() {
          console.log('element added to page.');
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const res = initWithContext(initComponent, { opts, shadowRoot });
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

          attributeChangedCallback(name, oldValue, newValue) {
              opts.onAttrUpdated(name, oldValue, newValue);
        }
      },
    );
        return {
          html: (attrs?: Attrs) => `${name}${attrs ? ` ${toAttrText(attrs)}` : ''}`
      element: (attrs?: Attrs) => document.createElement(name)
    };
  };
