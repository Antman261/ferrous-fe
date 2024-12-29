// deno-lint-ignore-file
// deno-lint-ignore-file explicit-function-return-type no-boolean-literal-for-arguments
import htm from 'https://unpkg.com/htm?module';
import { z, ZodObject, ZodObjectDef, ZodRawShape } from 'zod';
type Props = {
  name: string; // todo: implement type representing custom element name requirements https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#name
};
type Obj<T = unknown> = Record<string | number | symbol, T>;

const getTemplateById = (id: string): HTMLTemplateElement => {
  const templateElement = globalThis.document.getElementById(id);
  if (!isTemplateElement(templateElement)) throw new Error('Template not found');
  return templateElement;
};

const isTemplateElement = (e: unknown): e is HTMLTemplateElement =>
  e?.constructor?.name === 'HTMLTemplateElement';
function h(this: any, tag: any, attributes: any, ...children: any[]) {
  console.log(this, children);
  return { tag, attributes };
}

const hyper = htm.bind(h);

const elementCache = new Map<TemplateStringsArray, FerrousElement>();
type FerrousElement = { tag: string; html: string; attributes: Obj; children: any[] };

export const ftml = (statics: TemplateStringsArray, ...fields: unknown[]): FerrousElement => {
  const res = elementCache.get(statics) ?? ({
    ...hyper(statics, fields),
    html: String.raw({ raw: statics }, ...fields),
  });
  elementCache.set(statics, res);

  return res;
};

export function initialize(initialState, projector) {
  return {};
}

export function makeElement<T extends ZodRawShape>(
  propSchema: ZodObject<T>,
  elem: (props: z.infer<typeof propSchema>) => [],
): void {
  const e = elem();
  const element = class extends HTMLElement {
    static observedAttributes = elem.p;
    constructor() {
      super();

      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }
    /**
     * MDN: called each time the element is added to the document. The specification recommends that, as far as possible, developers should implement custom element setup in this callback rather than the constructor
     */
    connectedCallback() {
      // todo: register component listener with state update event emitters
    }
    /**
     * MDN: called each time the element is removed from the document.
     */
    disconnectedCallback() {
      // todo: deregister component listener from update emitters
    }
    /**
     * MDN: called each time the element is moved to a new document.
     */
    adoptedCallback() {
      // todo: probably do nothing?
    }
    /**
     * MDN: called when attributes are changed, added, removed, or replaced. See Responding to attribute changes for more details about this callback.
     */
    attributeChangedCallback(_name: any, _oldValue: any, _newValue: any) {
      // todo: call component updated listener
    }
  };
  globalThis.customElements.define(name, element);
}

/* TOdo: Enforce component name uniqueness */
