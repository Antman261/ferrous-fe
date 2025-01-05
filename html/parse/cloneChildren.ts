const deepClone = true;

export const cloneChildren = <T extends HTMLElement>(tmp: HTMLTemplateElement): T[] =>
  [...tmp.content.children].map((child) => child.cloneNode(deepClone) as T);
