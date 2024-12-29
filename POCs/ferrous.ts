type Statics = TemplateStringsArray;
type HTMLTemplate = HTMLTemplateElement;
type TemplateFunc<T = string, F = unknown> = (strings: Statics, ...fields: F[]) => T;
type FeHTMLElement<T extends HTMLElement = HTMLElement> = {
  html: TemplateFunc<T, Node>;
  txt: TemplateFunc<T>;
} & T;
export type ExtractMatchingProperties<T, V> = {
  [K in keyof T]: T[K] extends V ? T[K] : never;
};
export type AttrOf<T> = Partial<ExtractMatchingProperties<T, Attribute>>;

const templateCache = new Map<Statics, HTMLTemplate>();
const getRawText: TemplateFunc = (strings, ...fields) => String.raw({ raw: strings }, ...fields);

function getTemplate(strings: Statics, fields: unknown[]): HTMLTemplate {
  if (templateCache.has(strings)) {
    return templateCache.get(strings)!;
  }
  const template = document.createElement('template');
  template.innerHTML = getRawText(strings, fields);
  templateCache.set(strings, template);
  return template;
}

const deepClone = true;
function fromTemplate<T extends HTMLElement = HTMLElement>(tmp: HTMLTemplate): T {
  return tmp.cloneNode(deepClone) as T;
}

function html<T extends HTMLElement = HTMLElement>(
  strings: Statics,
  ...fields: Array<Node | Attribute>
): FeHTMLElement<T> {
  const element: FeHTMLElement<T> = {
    ...fromTemplate<T>(getTemplate(strings, fields)),
    html: (strings, ...fields) => {
      element.appendChild(html(strings, ...fields));
      return element;
    },
    txt: (strings, ...fields) => {
      element.textContent = getRawText(strings, ...fields);
    },
  };
  for (const field of fields) {
    if (field instanceof Node) element.appendChild(field);
  }
  return element;
}

type Obj<T = unknown> = Record<string | number | symbol, T>;
type Attribute = string | boolean;
export type Attributes = Record<string, Attribute> & { children?: Node[] };

type FeFunc = (attrs?: Obj) => FeElement;

interface FeElement extends HTMLElement {
  setStyle: (value: string) => void;
}

function fe<T extends Attributes>(feFunc: FeFunc, attrs?: T): TemplateFunc<FeElement, Node> {
  return (strings, ...fields) => {
    let style: HTMLStyleElement;
    const basicElement: FeElement = {
      ...html(strings, ...fields),
      setStyle: (styles) => {
        if (!style) {
          style = document.createElement('style');
          style.textContent = styles;
          basicElement.appendChild(style);
        }
      },
    };
    // add enhancements
    basicElement.setStyle =
      basicElement.toString =
        (): string => {
          return `<${feFunc.name}>${attrs?.children ?? ''}</${feFunc.name}>`;
        };
    return basicElement;
  };
}

function fender() {}
const css = getRawText;

// function defineElement() {}

export { css, fe, fender, html };
