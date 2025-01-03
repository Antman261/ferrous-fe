import { isPrimitive } from '@ferrous/util';
import { getRawText, Statics } from './tag.ts';
import { HTMLTemplate } from './dom.ts';

// const templateCache = new Map<Statics, HTMLTemplate>();

export function getTemplate(strings: Statics, fields: unknown[]): HTMLTemplate {
  // if (templateCache.has(strings)) {
  //   return templateCache.get(strings)!;
  // }
  const template = document.createElement('template');
  template.innerHTML = getRawText(strings, fields);
  // templateCache.set(strings, template);
  return template;
}

const deepClone = true;
export function fromTemplate<T extends HTMLElement = HTMLElement>(
  tmp: HTMLTemplate,
): T {
  return tmp.content.firstChild?.cloneNode(deepClone) as T;
}

export function rawToHTML<T extends HTMLElement = HTMLElement>(strings: Statics, fields: unknown[]): T {
  const template = document.createElement('template');
  template.innerHTML = getRawText(strings, fields);
  return template.content.firstChild?.cloneNode(deepClone) as T;
}

export function textToHTML<T extends HTMLElement = HTMLElement>(text: string) {
  const template = document.createElement('template');
  template.innerHTML = text;
  return template.content.firstChild?.cloneNode(deepClone) as T;
}

const PARTS = {
  HOST: 0, // directly inside host
  ATTRIBUTE: 1, // inside an element tag, but not yet inside its body: <tag | -- |>
  ELEMENT: 2, // inside an element body: <tag[ attrs]>| -- |</tag>
  TEXT_NODE: 3, // inside an element, after some text: <tag>/(.)+/| -- |</tag>
  TEXT_ELEMENT: 4, // plain text elements like <script>, <textarea>
} as const;
type Part = typeof PARTS;

function tagToHTML(strings: Statics, values: unknown[]) {
  const template = document.createElement('template');
  let part: HTMLElement = template;
  let partType: Part[keyof Part] = PARTS.HOST;
  let pos = 0;
  let end = strings.length;

  while (pos < end) {
    const string = strings[pos];
    const value = values[pos];
    if (string.trim().length === 0) { 
      if (value instanceof Node) {
        template.appendChild(value);
        continue;
      }
      if (isPrimitive(value)) {
        template.appendChild(textToHTML(value?.toString() ?? ''))
      }
    }

    let charPos = 0;
    let charEnd = string.length;
    while (charPos < charEnd) {
      if ()
      charPos++;
    }

    // end
    pos++;
  }
}
