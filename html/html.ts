import { AttrValue } from './attrs.ts';
import { withObjectContext } from './ctx.ts';
import { textToHtmlElements } from './parse/toHTML.ts';
import { Statics, tagFnToText, TemplateFunc } from './tag.ts';
import { mergeObjects } from './util.ts';
/**
 * An HTMLElement instance extended with FerrousFE utilities to improve DX.
 *
 * For example, to create and then change a button's text:
 *
 * ```example
 * const button = btn`Click me!`.on('click', button.do.txt`Thanks!`);
 * body.push`<div class='btn-bar'>${button1}</div>`;
 * ```
 *
 * By contrast, in vanilla javascript this is:
 *
 * ```ts
 * const button = document.createElement('button');
 * button.innerHTML = 'Click me!';
 * button.onclick = () => button.innerHTML = 'Thanks!';
 *
 * const div = document.createElement('div');
 * div.class = 'btn-bar';
 * div.appendChild(button)
 * document.body.appendChild(div);
 * ```
 */
export type Element<T extends HTMLElement = HTMLElement> = FerrousMethods<T> & T;
export type FerrousMethods<T> = {
  html: TemplateFunc<T & FerrousMethods<T>, Node>;
  txt: TemplateFunc<T & FerrousMethods<T>>;
  /**
   * Add or change attributes
   *
   * ```ts
   * btn`Click me`.attr`action="submit" class="primary"`
   * ```
   */
  attr: TemplateFunc<T & FerrousMethods<T>>;
  append: TemplateFunc<T & FerrousMethods<T>, Node>;
  getAttrs: () => Record<string, string | boolean>;
  // do: LazyFactory<T>; todo: implement this -- getting `do` returns a lazy function whose behavior is defined by calls to its methods, and its methods return references to itself instead of performing the action
  // style: TemplateFunc<T, (attrs: Attrs) => string>;
  // attr: example btn`Click me`.attr`action="submit" class="primary"` or btn`Click me`.action`submit`
  // clone: () => T;
};
// idea: tmp`<div>my template</div>`

export const html = withObjectContext(
  function html<T extends HTMLElement = HTMLElement>(
    strings: Statics,
    ...fields: Array<Node | AttrValue>
  ): Element<T> {
    // todo: need to parse strings for HTML element strings, turn them into elements, and then append any subsequent child fields
    const [vanillaElement] = textToHtmlElements<T>(tagFnToText(strings, fields));
    const element: Element<T> = mergeObjects<T, FerrousMethods<T>>(
      vanillaElement,
      makeMagnetic<T>(() => element),
    );
    // for (const field of fields) {
    //   if (field instanceof Node) element.appendChild(field);
    // }
    return element;
  },
);

const makeMagnetic = <T extends HTMLElement = HTMLElement>(get: () => Element<T>): FerrousMethods<T> => ({
  html: (strings, ...fields) => {
    if (strings.length === 0 && fields.length > 0) {
      fields.forEach((child) => get().appendChild(child));
    }
    get().appendChild(html(strings, ...fields));
    return get();
  },
  txt: (strings, ...fields) => {
    get().textContent = tagFnToText(strings, ...fields);
    return get();
  },
  attr: (strings, ...fields) => {
    tagFnToText(strings, ...fields).split(' ').map((a) => {
      const [key, val = ''] = a.split('=');
      const value = val.replaceAll('"', '');
      value === 'false' ? get().removeAttribute(key) : get().setAttribute(key, value);
    });
    return get();
  },
  append: (_strings, ...fields) => {
    fields.flat().forEach((child) => get().appendChild(child));
    return get();
  },
  getAttrs: () => {
    const attrs: Record<string, string | boolean> = {};
    for (const attr of get().attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  },
});

type Opt = {
  observedAttrs?: string[];
  onAttrUpdated?: (name?: string, oldValue?: unknown, newValue?: unknown) => void;
}; // todo: automatically observe attrs
export const defineCustomElement =
  // deno-lint-ignore explicit-module-boundary-types
  (opts, initComponent) => {
    const name = toKebabCase(opts.name);

    // TODO template fn: statics.length > 1 ? each field becomes a tracked object and associated with a parent (strings become FeXT), on subsequent re-renders all elements are re-evaluated and directly updated.
    // deno-lint-ignore no-undef
    customElements.define(
      name,
      // deno-lint-ignore no-undef
      class extends HTMLElement {
        static get observedAttributes() {
          return opts?.observedAttrs ?? [];
        }
        constructor() {
          super();
        }
        connectedCallback() {
          console.log('element added to page.');
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const res = initWithContext(initComponent, { opts, shadowRoot });
          shadowRoot.appendChild(res.render());
        }

        disconnectedCallback() {
          console.log('element removed from page.');
        }

        adoptedCallback() {
          console.log('element moved to new page.');
        }

        attributeChangedCallback(name, oldValue, newValue) {
          console.log('element attributes changed.');
        }
      },
    );
    return (attrs?: Attrs) => {
      if (getContext().html) {
        return `${name}${attrs ? ` ${toAttrText(attrs)}` : ''}`;
      }
      return document.createElement(name);
    };
  };
