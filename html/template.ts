import { Alphalow, alphalow, isDefinedPrimitive, makeConstEnum } from '@ferrous/util';
import { getRawText, Statics } from './tag.ts';

const deepClone = true;

export function rawToHTML<T extends HTMLElement = HTMLElement>(strings: Statics, fields: unknown[]): T {
  const template = document.createElement('template');
  template.innerHTML = getRawText(strings, fields);
  return template.content.firstChild?.cloneNode(deepClone) as T;
}

export function textToHTML<T extends HTMLElement = HTMLElement>(text: string): T {
  const template = document.createElement('template');
  template.innerHTML = text;
  return template.content.firstChild?.cloneNode(deepClone) as T;
}

const PARTS = makeConstEnum(
  [
    'TAG_NAME', // Inside a tag, but not past the name: <|-|tag>, <t|-|ag>
    'TAG', // <tag |-|>, <tag |-|attr>
    'CLOSING_TAG', // Inside a closing tag, but not yet complete: </|-|tag>, </t|-|ag>, </|-|>
    'ATTRIBUTE_NAME', // inside an attribute name: <tag c|-|lass="my value">
    'ATTRIBUTE_VALUE', // inside an attribute value: <tag class="|-|my value">
    'ELEMENT', // inside an element body: <tag[ attrs]>|-|</tag>
    'TEXT_NODE', // inside an element, after some text: <tag[ attrs]>any text |-|</tag>
    'RAW_TEXT_ELEMENT', // plain text elements like <script>, <textarea>
    'PARENT', // destination only! a parent is an element, including host (the template)
    'CONTINUE',
  ] as const,
);
type Part = keyof typeof PARTS;

type NextPartPredicate = (char: string, fragment: string) => boolean;
type NextPartTuple = [Part, NextPartPredicate];
const tagStart = '<';
const tagEnd = '>';
const closingTagStart = '</';
const whiteSpace = ' \n\t\r';
const rawTextTags = ['<script', '<style', '<textarea', '<title'] as const;
const closeElementShorthand = `/>`;

const isRawTextElement: NextPartPredicate = (c, f) =>
  c === tagEnd && rawTextTags.some((tag) => f.startsWith(tag));
const isTagName: NextPartPredicate = (c) => c === tagStart;
const isElement: NextPartPredicate = (c) => c === tagEnd;
const isClosingTag: NextPartPredicate = (_, f) => f.endsWith(closingTagStart);

const NO_CHANGE: NextPartTuple = [PARTS.CONTINUE, () => true];

const nextPartMap: Record<Part, NextPartTuple[]> = {
  CONTINUE: [], // destination only
  PARENT: [
    [PARTS.TAG_NAME, isTagName],
    [PARTS.TEXT_NODE, (c) => whiteSpace.includes(c) === false],
    NO_CHANGE,
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
    NO_CHANGE,
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
    NO_CHANGE,
  ],
  CLOSING_TAG: [
    [PARTS.PARENT, (_, f) => f.endsWith(tagEnd)],
    NO_CHANGE,
  ],
  ATTRIBUTE_NAME: [
    /** <tag attr="|-|val"> */
    [PARTS.ATTRIBUTE_VALUE, (_, f) => f.endsWith('=')],
    /** <textarea disabled>|-| */
    [PARTS.RAW_TEXT_ELEMENT, isRawTextElement],
    /** <tag my-boolean>|-| */
    [PARTS.ELEMENT, isElement],
    /** <tag is-foo |-|is-bar>, <tag is-foo |-|>, <tag is-foo/|-|> */
    [PARTS.TAG, (c) => c === '/' || whiteSpace.includes(c)],
    NO_CHANGE,
  ],
  ATTRIBUTE_VALUE: [
    /** <tag attr='val'|-|>, <tag attr="val"|-|>, <tag attr="\"val\""|-|>, <tag attr="\\"|-|> */
    [PARTS.TAG, (c, f) => c === f.at(0) && (!f.endsWith(`\\${f.at(0)}`) || f.endsWith(`\\\\${f.at(0)}`))],
    NO_CHANGE,
  ],
  ELEMENT: [
    /** <parent><|-|tag> */
    [PARTS.TAG_NAME, isTagName],
    /** <tag>H|-|ello, <tag>  H|-|ello */
    [PARTS.TEXT_NODE, (c) => whiteSpace.includes(c) === false],
    NO_CHANGE,
  ],
  TEXT_NODE: [
    [PARTS.TAG_NAME, isTagName],
    [PARTS.PARENT, (c, f) => whiteSpace.includes(c) && whiteSpace.includes(f.at(-2)!)],
    NO_CHANGE,
    /* text returns to parent at two consecutive white space chars */
  ],
  RAW_TEXT_ELEMENT: [
    [PARTS.CLOSING_TAG, isClosingTag],
    NO_CHANGE,
  ],
  // can only call toString on value inside raw txt
};
const withCharFragmentPredicate = (char: string, frag: string) => ([, p]: NextPartTuple) => p(char, frag);

function tagToHTML(strings: Statics, values: unknown[]) {
  // todo: load from context cache for re-render!
  const template = document.createElement('template');
  const parents: HTMLElement[] = [template];
  let parent: HTMLElement = template;
  let currentAttribute: Attr | undefined;
  const addParent = (element: HTMLElement): void => {
    parent.appendChild(element);
    parents.push(element);
    parent = element;
  };
  const removeParent = (): void => {
    parents.pop();
    const newParent = parents.at(-1);
    if (!newParent) return;
    parent = newParent;
    // todo: add to context
  };
  let part: Part = PARTS.PARENT;
  let arrayPos = 0;
  const arrayEnd = strings.length;

  while (arrayPos < arrayEnd) {
    const string = strings[arrayPos];
    const value = values[arrayPos];

    let currentFragment = '';

    let strPos = 0;
    const strEnd = string.length;
    while (strPos < strEnd) {
      const char = string.at(strPos)!;
      currentFragment += char;
      const [nextPart]: NextPartTuple = nextPartMap[part]
        .find(withCharFragmentPredicate(char, currentFragment))!;

      if (nextPart === PARTS.CONTINUE) {
        strPos++;
        continue;
      }

      switch (part) {
        case PARTS.PARENT:
          break;
        case PARTS.TAG_NAME: {
          if (nextPart === PARTS.CLOSING_TAG) {
            break;
          }
          const newTag = document.createElement(
            currentFragment.trim().replace(tagStart, '').replace(closeElementShorthand, ''),
          );
          if (nextPart !== PARTS.PARENT) {
            addParent(newTag);
          }
          break;
        }
        case PARTS.TAG:
          if (nextPart === PARTS.PARENT) {
            removeParent();
          }
          break;
        case PARTS.ATTRIBUTE_NAME: {
          const attr = document.createAttribute(currentFragment.trim().replace('=', ''));
          if (nextPart === PARTS.ATTRIBUTE_VALUE) {
            currentAttribute = attr;
          }
          parent.setAttributeNode(attr);
          break;
        }
        case PARTS.ATTRIBUTE_VALUE:
          if (`'"`.includes(currentFragment.at(0)!)) {
            currentFragment = currentFragment.slice(1, -1);
          }
          currentAttribute!.value = currentFragment;
          currentAttribute = undefined;
          break;
        case PARTS.CLOSING_TAG:
          removeParent();
          break;
        case PARTS.ELEMENT:
          break;
        case PARTS.TEXT_NODE: {
          const textNode = document.createTextNode(currentFragment.slice(0, -1));
          parent.appendChild(textNode);
          break;
        }
        case PARTS.RAW_TEXT_ELEMENT: {
          const text = currentFragment.slice(0, -2);
          const textNode = document.createTextNode(text);
          parent.appendChild(textNode);
          break;
        }
      }

      currentFragment = '';
      part = nextPart;

      strPos++;
    }
    if (value === undefined || value === null) {
      arrayPos++;
      continue;
    }
    if (value instanceof Node) {
      parent.appendChild(value);
      arrayPos++;
      continue;
    }

    if (isDefinedPrimitive(value)) {
      parent.appendChild(textToHTML(value.toString() ?? ''));
      arrayPos++;
      continue;
    }

    // end
    arrayPos++;
  }
}
