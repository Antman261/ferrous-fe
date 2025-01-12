import { toKebabCase } from '@std/text';
import { Stateable } from '../global/state.ts';
import { Attributes, toAttrText } from '../attrs.ts';
import { ContextualComponent, InitComponent, initWithContext } from './initWithContext.ts';
import { CustomElementOpt } from './types.ts';

type Ret<A extends Attributes> = {
  html: (attrs?: Partial<A>) => string;
  element: (attrs?: Partial<A>) => HTMLElement;
};
type DefineCustomElementFn = <S extends Stateable, A extends Attributes>(
  opts: CustomElementOpt<S, A>,
  initComponent: InitComponent<S>,
) => Ret<A>;

export const defineCustomElement: DefineCustomElementFn = <S extends Stateable, A extends Attributes>(
  opts: CustomElementOpt<S, A>,
  initComponent: InitComponent<S>,
): Ret<A> => {
  const name = toKebabCase(opts.name);
  let component: ContextualComponent;
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
        shadowRoot.host.firstElementChild;
        component = initWithContext(initComponent, { opts, shadowRoot });
      }

      disconnectedCallback() {
        console.log('element removed from page.');
      }

      adoptedCallback() {
        console.log('element moved to new page.');
      }

      attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        component?.updateAttributes(name, oldValue, newValue);
      }
    },
  );
  return {
    // @ts-expect-error HKT error
    html: (attrs) => `${name}${attrs ? ` ${toAttrText<A>(attrs)}` : ''}`,
    element: (attrs) => {
      const e = document.createElement(name);
      if (attrs) {
        for (const [name, value] of Object.entries(attrs)) {
          if (typeof value === 'boolean') {
            if (value === true) e.setAttribute(name, '');
            continue;
          }
          e.setAttribute(name, value);
        }
      }
      return e;
    },
  };
};
