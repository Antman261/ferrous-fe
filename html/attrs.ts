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

// type test for AttrName
// const c = <S extends string>(a: AttrName<S>) => a;
// c('abc-xml');
// c('aBCxml');
// c('abc-=xml');
// c('xml-beep');
