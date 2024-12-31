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
