export type HTMLTemplate = HTMLTemplateElement;
export type HElement = HTMLElement;

export const document: Document = isServerSide ? new DOMParser(baseDoc) : document;
