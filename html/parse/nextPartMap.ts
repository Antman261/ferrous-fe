import { Alphalow, alphalow } from '@ferrous/util';
import {
  closeElementShorthand,
  closingTagStart,
  Part,
  PARTS,
  rawTextTags,
  tagEnd,
  tagStart,
  whiteSpace,
} from './constants.ts';

type NextPartPredicate = (char: string, fragment: string) => boolean;
type NextPartTuple = [Part, NextPartPredicate];

const isRawTextElement: NextPartPredicate = (c, f) =>
  c === tagEnd && rawTextTags.some((tag) => f.startsWith(tag));
const isTagName: NextPartPredicate = (c) => c === tagStart;
const isElement: NextPartPredicate = (c) => c === tagEnd;
const isClosingTag: NextPartPredicate = (_, f) => f.endsWith(closingTagStart);

const nextPartMap: Record<Part, NextPartTuple[]> = {
  PARENT: [
    [PARTS.TAG_NAME, isTagName],
    [PARTS.TEXT_NODE, (c) => whiteSpace.includes(c) === false],
  ],
  TAG_NAME: [
    /** <tag |-|attr="val"> */
    [PARTS.TAG, (c) => whiteSpace.includes(c)],
    /** <tag/>|-| */
    [PARTS.PARENT, (_, f) => f.endsWith(closeElementShorthand)],
    /** <script>|-| */
    [PARTS.RAW_TEXT_ELEMENT, isRawTextElement],
    /** <tag>|-| */
    [PARTS.ELEMENT, isElement],
    /** </|-|tag> */
    [PARTS.CLOSING_TAG, (_, f) => f.at(0) === '/'],
  ],
  /**
   * <tag |-|attr="val">, <tag attr="val"|-|>, <tag battr="bal"|-|attr="val">
   */
  TAG: [
    /** <tag a|-|ttr="val">, <tag battr="bal"a|-|ttr="val"> */
    [PARTS.ATTRIBUTE_NAME, (c) => alphalow.includes(c as Alphalow)],
    /** <tag attr="val"/>|-|, <tag attr="val" />|-|, <tag />|-| */
    [PARTS.PARENT, (_, f) => f.endsWith(closeElementShorthand)],
    /** <script attr="val">|-|, <script attr="val">|-| */
    [PARTS.RAW_TEXT_ELEMENT, isRawTextElement],
    /** <tag >|-|, <tag>|-| */
    [PARTS.ELEMENT, isElement],
  ],
  CLOSING_TAG: [
    [PARTS.PARENT, (_, f) => f.endsWith(tagEnd)],
  ],
  ATTRIBUTE_NAME: [
    /** <tag attr="|-|val"> */
    [PARTS.ATTRIBUTE_VALUE, (c) => c === '='],
    /** <textarea disabled>|-| */
    [PARTS.RAW_TEXT_ELEMENT, isRawTextElement],
    /** <tag my-boolean>|-| */
    [PARTS.ELEMENT, isElement],
    /** <tag is-foo |-|is-bar>, <tag is-foo |-|>, <tag is-foo/|-|> */
    [PARTS.TAG, (c) => c === '/' || whiteSpace.includes(c)],
  ],
  ATTRIBUTE_VALUE: [
    /** <tag attr='val'|-|>, <tag attr="val"|-|>, <tag attr="\"val\""|-|>, <tag attr="\\"|-|> */
    [PARTS.TAG, (c, f) => c === f.at(0) && (!f.endsWith(`\\${f.at(0)}`) || f.endsWith(`\\\\${f.at(0)}`))],
  ],
  ELEMENT: [
    /** <element><|-|tag> */
    [PARTS.TAG_NAME, isTagName],
    /** <element>H|-|ello, <element>  H|-|ello */
    [PARTS.TEXT_NODE, (c) => whiteSpace.includes(c) === false],
  ],
  TEXT_NODE: [
    [PARTS.TAG_NAME, isTagName],
    [PARTS.PARENT, (c, f) => whiteSpace.includes(c) && whiteSpace.includes(f.at(-2)!)],
    /* text returns to parent at two consecutive white space chars */
  ],
  RAW_TEXT_ELEMENT: [
    [PARTS.CLOSING_TAG, isClosingTag],
  ],
  // can only call toString on value inside raw txt
};

export const getNextPart = (char: string, frag: string, part: Part): Part => {
  for (const [nextPart, isNextPart] of nextPartMap[part]) {
    if (isNextPart(char, frag)) return nextPart;
  }
  return part;
};
