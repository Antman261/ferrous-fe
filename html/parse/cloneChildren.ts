const deepClone = true;

export const cloneChildren = <T extends HTMLElement>(tmp: HTMLTemplateElement): T[] =>
  [...tmp.content.children].map((child) => child.cloneNode(deepClone) as T);

export const deepCloneNode = <T extends Element>(node: T): T => node.cloneNode(deepClone) as T;
