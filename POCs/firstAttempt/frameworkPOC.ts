// deno-lint-ignore-file
// deno-lint-ignore-file explicit-function-return-type no-boolean-literal-for-arguments
import htm from 'https://unpkg.com/htm?module';
import { z, ZodObject, ZodRawShape } from 'zod';
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
  return { tag, attributes, children };
}

const hyper = htm.bind(h);

const elementCache = new Map<TemplateStringsArray, FerrousElement>();
type FerrousElement = { tag: string; html: string; attributes: Obj; children: any[] };
type Observed = Obj & { attrs: string[] };

export const ftml = (statics: TemplateStringsArray, ...fields: unknown[]): FerrousElement => {
  const res = elementCache.get(statics) ?? ({
    ...hyper(statics, fields),
    html: String.raw({ raw: statics }, ...fields),
  });
  elementCache.set(statics, res);

  return res;
};

type Event = { name: string; payload?: Obj };
type Projector = (state: Obj, event: Event) => void;
type DispatchEvent<Events extends Event = Event> = (name: Events['name'], payload?: Events['payload']) => void; 
type CommandHandler<State extends Obj = Obj> = (e: PointerEvent, s: State) => void;
const commands = new Map<string, CommandHandler>();

export function issueFeCommand(name: string): void {
  const fn = commands.get(name);
  if (!fn) { 
    throw new Error('there is no handler');
  }
  fn()
}

export function initialize<State extends Obj>(initialState: State, projector: Projector) {
  type FerrousFuncs = {
    getState: ()=>State, 
    registerCommand: (name: string, handler: CommandHandler<State>) => void;
    dispatchEvent: DispatchEvent;
    observed: (ob: Obj) => Observed;
}
  type ElementCreator = <T>(fe: FerrousFuncs) => (props: T) => [Observed, FerrousElement];
  const state = initialState;
  const
  const funcs: FerrousFuncs = {
    dispatchEvent: (name, payload) => projector(state, { name, payload }),
    getState: () => state,
    registerCommand: (name, handler) => {
      const computedName = `${tag}${name}`;
      return `issueFeCommand("${computedName}");`;
    },
    observed: (ob: Obj) => {
      const proxy = new Proxy(ob, {});
      const ext = Object.assign(proxy, {
        getTarget() {
          return ob;
        },
        isProxy: true as const,
        attrs: Object.keys(ob),
      });
      return ext;
    },
  }
  return {
    makeElement,
    dispatchEvent, ext;
    },
    registerCommand: (name: string, handler: CommandHandler): void => {
      return 
    }
  };
}

export function makeElement<T extends ZodRawShape>(
  propSchema: ZodObject<T>,
  elem: ((props: z.infer<typeof propSchema>) => [Observed, FerrousElement],
): void {
  const [observed, ferrous] = elem();
  const element = class extends HTMLElement {
    static observedAttributes = e[0];
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
