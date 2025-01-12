import { Alphalow, DoesNotStartWith, ExtractMatchingProperties, StringOf } from '@ferrous/util';

export type AttrOf<T> = Partial<ExtractMatchingProperties<T, AttrValue>>;

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*
 */
type AttrChar = Alphalow | '-';
export type AttrName<S extends string> = S & StringOf<DoesNotStartWith<S, 'xml'>, AttrChar>;
export type AttrValue = string | null; // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#boolean_attributes
export type AttributeText<S extends string> = `${AttrName<S>}=${AttrValue}`;
export type Attributes = Record<string, AttrValue>;

export type FeAttx = {
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
export const toAttrText = <A extends Attributes>(attrs: A): string =>
  Object.entries(attrs).map(([name, value]) => {
    if (typeof value === 'boolean') {
      if (value === true) return name;
      return '';
    }
    return `${name}="${value.toString().trim()}"`;
  })..join(' ');

// type test for AttrName
// const c = <S extends string>(a: AttrName<S>) => a;
// c('abc-xml');
// c('aBCxml');
// c('abc-=xml');
// c('xml-beep');
