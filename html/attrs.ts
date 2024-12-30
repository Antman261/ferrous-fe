import { ExtractMatchingProperties } from './util.ts';

export type AttrOf<T> = Partial<ExtractMatchingProperties<T, Attribute>>;

export type Attribute = string | boolean;
export type Attributes = Record<string, Attribute> & { children?: Node[] };
