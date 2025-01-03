import { Alphalow, DoesNotStartWith, ExtractMatchingProperties, StringOf } from '@ferrous/util';

export type AttrOf<T> = Partial<ExtractMatchingProperties<T, AttrValue>>;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*
 */
type AttrChar = Alphalow | '-';
export type AttrName<S extends string> = S & StringOf<DoesNotStartWith<S, 'xml'>, AttrChar>;
export type AttrValue = string | boolean; // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes
export type AttributeText<S extends string> = `${AttrName<S>}=${AttrValue}`;
export type Attributes = Record<string, AttrValue> & { children?: Node[] };

type FeAttx = {
  attrName: string;
  targets: Set<HTMLElement>;
  attachParent: (e: HTMLElement) => void;
  detachParent: (e: HTMLElement) => void;
};

export type AttrUtil = {
  class: (classes: string[]) => FeAttx;
};

export const attr: AttrUtil = {
  class: (classes) => {
    const classText = classes.join(' ');
    // if ()
    // todo: find the FeAttx by context and update
  },
};

// type test for AttrName
// const c = <S extends string>(a: AttrName<S>) => a;
// c('abc-xml');
// c('aBCxml');
// c('abc-=xml');
// c('xml-beep');
