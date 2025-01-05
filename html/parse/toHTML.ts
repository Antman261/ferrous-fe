import { cloneChildren } from './cloneChildren.ts';

const template = document.createElement('template');

// export function tagToHtmlElement<T extends HTMLElement = HTMLElement>(
//   strings: Statics,
//   fields: unknown[],
// ): T {
//   const text = tagFnToText(strings, fields);
//   return textToHtmlElement<T>(text);
// }
export function textToHtmlElements<T extends HTMLElement = HTMLElement>(text: string): T[] {
  template.innerHTML = '';
  template.innerHTML = text;
  return cloneChildren<T>(template);
}
