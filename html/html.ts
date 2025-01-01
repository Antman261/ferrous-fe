import { AttrValue } from './attrs.ts';
import { getRawText, Statics, TemplateFunc } from './tag.ts';
import { rawToHTML } from './template.ts';
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

export function html<T extends HTMLElement = HTMLElement>(
  strings: Statics,
  ...fields: Array<Node | AttrValue>
): Element<T> {
  // todo: need to parse strings for HTML element strings, turn them into elements, and then append any subsequent child fields
  const vanillaElement = rawToHTML<T>(strings, fields);
  const element: Element<T> = mergeObjects<T, FerrousMethods<T>>(
    vanillaElement,
    // @ts-ignore
    makeMagnetic<T>(vanillaElement),
  );
  for (const field of fields) {
    if (field instanceof Node) element.appendChild(field);
  }
  return element;
}

const makeMagnetic = <T extends HTMLElement = HTMLElement>(element: Element<T>): FerrousMethods<T> => ({
  html: (strings, ...fields) => {
    if (strings.length === 0 && fields.length > 0) {
      fields.forEach((child) => element.appendChild(child));
    }
    element.appendChild(html(strings, ...fields));
    return element;
  },
  txt: (strings, ...fields) => {
    element.textContent = getRawText(strings, ...fields);
    return element;
  },
  attr: (strings, ...fields) => {
    getRawText(strings, ...fields).split(' ').map((a) => {
      const [key, val = ''] = a.split('=');
      const value = val.replaceAll('"', '');
      value === 'false' ? element.removeAttribute(key) : element.setAttribute(key, value);
    });
    return element;
  },
  append: (_strings, ...fields) => {
    fields.flat().forEach((child) => element.appendChild(child));
    return element;
  },
  getAttrs: () => {
    const attrs: Record<string, string | boolean> = {};
    for (const attr of element.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  },
});

type Opt = {
  observedAttrs?: string[];
  onAttrUpdated?: (name?: string, oldValue?: unknown, newValue?: unknown) => void;
}; // todo: automatically observe attrs
export const tmp =
  <T extends HTMLElement = HTMLElement>(name: string, opt?: Opt) =>
  (strings: Statics, ...fields: Array<Node | AttrValue>): Element<T> => {
    const vanillaElement = rawToHTML<T>(strings, fields);
    const element: Element<T> = mergeObjects<T, FerrousMethods<T>>(
      vanillaElement,
      // @ts-ignore
      makeMagnetic<T>(vanillaElement),
    );
    // deno-lint-ignore no-undef
    customElements.define(
      name, // todo: get from html
      // deno-lint-ignore no-undef
      class extends HTMLElement {
        static get observedAttributes() {
          return opt?.observedAttrs ?? [];
        }
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.appendChild(element);
        }
      },
    );
    for (const field of fields) {
      if (field instanceof Node) element.appendChild(field);
    }
    return element;
  };
