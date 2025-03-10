import { Maybe } from '@ferrous/util';

type Opt = { withChildren: boolean };
export type ParentStack = {
  top: TopParentMethods;
  getAttr(): Maybe<Attr>;
  setAttr(a: Attr): void;
  setAttrValue(v: string): void;
  remove(): void;
  currentIndex(): number;
  bottom: HTMLTemplateElement;
};

type TopParentMethods = {
  addChild: (e: HTMLElement | Element, o?: Opt) => void;
  addTextNode: (t: Text) => void;
  setRawText: (t: string) => void;
};

const defaultOpt = { withChildren: true };

export const initParentStack = (tmp: HTMLTemplateElement): ParentStack => {
  const parents: HTMLElement[] = [tmp];
  let attribute: Maybe<Attr>;
  const getTop = () => parents.at(-1) ?? tmp;
  return {
    top: {
      addChild: (element, { withChildren } = defaultOpt) => {
        getTop().appendChild(element);
        if (withChildren && element instanceof HTMLElement) parents.push(element);
      },
      addTextNode: (textNode) => getTop().appendChild(textNode),
      setRawText: (text) => getTop().textContent = text,
    },
    getAttr: () => attribute,
    setAttr: (value) => getTop().setAttributeNode(attribute = value),
    setAttrValue: (value) => {
      attribute!.value = value;
      attribute = undefined;
    },
    remove: () => parents.pop(),
    currentIndex: () => parents.length - 1,
    bottom: tmp,
  };
};
