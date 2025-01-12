import { getDoc, Primitive } from '@ferrous/util';
import { Statics } from '../tag.ts';
import { closeElementShorthand, Part, PARTS, tagStart } from './constants.ts';
import { getNextPart } from './nextPartMap.ts';
import { deepCloneNode } from './cloneChildren.ts';
import { initParentStack, ParentStack } from './initParentStack.ts';
import { getContext } from '../customElement/ctx.ts';
import { ComponentContext } from '../customElement/componentContext.ts';
import { isWeakNever } from '../util.ts';

const { createElement, createTextNode, createAttribute } = getDoc();

export type Value = Exclude<Primitive, symbol> | (() => Value) | HTMLElement | HTMLCollection | Attr | Text;

const staticsTemplateMap = new Map<Statics, HTMLTemplateElement>();
const hasExistingTemplate = (strings: Statics): boolean => staticsTemplateMap.has(strings);
const getTemplate = (strings: Statics): HTMLTemplateElement => {
  if (!hasExistingTemplate(strings)) {
    staticsTemplateMap.set(strings, createElement('template'));
  }
  return staticsTemplateMap.get(strings)!;
};

export function tagToHtmlElements(strings: Statics, values: Value[]): void {
  // todo: load parsed statics from context cache for efficient re-render
  const ctx = getContext<ComponentContext>();
  if (!ctx.parents) {
    ctx.parents = initParentStack(getTemplate(strings));
  }
  const {
    parents,
    isUnrenderedInstance,
    parseValueCallCache,
    shadowRoot,
    isFirstInstanceOfComponent,
    previousUpdateValues,
  } = ctx;
  if (isFirstInstanceOfComponent === false && isUnrenderedInstance) {
    for (const child of parents.bottom.content.children) {
      // clone the template elements to the shadow root,
      // now we only need to update the values
      shadowRoot.appendChild(deepCloneNode(child));
    }
  }

  let part: Part = PARTS.PARENT;

  let arrayPos = 0;
  const arrayEnd = strings.length;

  while (arrayPos < arrayEnd) {
    const [string, value] = [strings[arrayPos], values[arrayPos]];
    if (isFirstInstanceOfComponent) {
      // by definition, the statics can never change so we only need to do this once
      part = parseString({ string, parents, part });
      parseValueCallCache.push([parents.currentIndex(), part]);
    }
    const prevValue = previousUpdateValues[arrayPos];
    if (isUnrenderedInstance) {
      part = parseValue({ value, parents, part });
    } else {
    }

    arrayPos++;
  }
}

type ParseValueOpt = {
  value: Value;
  part: Part;
  parents: ParentStack;
};
function updateValue({ value, parents, part }: ParseValueOpt, prevValue: Value | undefined): Part {
  if (prevValue !== undefined) {
    switch (typeof prevValue) {
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean':
        part = parseString({ string: value.toString(), part, parents });
        break;
      case 'object':
        if (value instanceof Attr) {
          parents.setAttr(value);
          break;
        }
        if (value instanceof Text) {
          parents.top.addTextNode(value);
          break;
        }
        if (value instanceof HTMLElement) {
          parents.top.addChild(value, { withChildren: false });
          break;
        }
        if (value instanceof HTMLCollection) {
          for (const child of value) {
            parents.top.addChild(child, { withChildren: false });
          }
          break;
        }
        if (value !== null) {
          console.warn('Unexpected value in template', value);
          break;
        }
        break;
      case 'function':
        parseValue({ value: value(), parents, part });
        break;
      case 'symbol':
      case 'undefined':
    }
  }
  return parseValue({ value, parents, part });
}
function parseValue({ value, parents, part }: ParseValueOpt): Part {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'bigint':
    case 'boolean':
      part = parseString({ string: value.toString(), part, parents });
      break;
    case 'object':
      if (value instanceof Attr) {
        parents.setAttr(value);
        break;
      }
      if (value instanceof Text) {
        parents.top.addTextNode(value);
        break;
      }
      if (value instanceof HTMLElement) {
        parents.top.addChild(value, { withChildren: false });
        break;
      }
      if (value instanceof HTMLCollection) {
        for (const child of value) {
          parents.top.addChild(child, { withChildren: false });
        }
        break;
      }
      if (value !== null) {
        console.warn('Unexpected value in template', value);
        break;
      }
      break;
    case 'function':
      parseValue({ value: value(), parents, part });
      break;
    case 'symbol':
    case 'undefined':
  }
  return part;
}

type ParseStringOpt = {
  string: string;
  part: Part;
  parents: ParentStack;
};
function parseString({ string, part: startPart, parents }: ParseStringOpt): Part {
  let part = startPart;
  let fragment = '';
  let strPos = 0;
  const strEnd = string.length;

  while (strPos < strEnd) {
    const char = string.at(strPos)!;
    fragment += char;
    const nextPart = parseChar({ char, fragment, parents, part });

    if (nextPart !== part) {
      fragment = '';
      part = nextPart;
    }

    strPos++;
  }

  return part;
}
type ParseCharOpt = {
  char: string;
  fragment: string;
  part: Part;
  parents: ParentStack;
};
function applyParseCharResult({ char, fragment, part, parents }: ParseCharOpt): Part {
  const nextPart = getNextPart(char, fragment, part);

  if (nextPart === part) return nextPart;
  if (nextPart === PARTS.CLOSING_TAG) return nextPart;
  const el = parseElementFromChar({ char, fragment, part, parents, nextPart });

  switch (part) {
    case PARTS.PARENT:
      break;
    case PARTS.TAG_NAME: {
      const newTag = parseElementFromChar(fragment, part);
      parents.top.addChild(newTag, { withChildren: nextPart !== PARTS.PARENT });
      break;
    }
    case PARTS.TAG:
      if (nextPart === PARTS.PARENT) parents.remove();
      break;
    case PARTS.ATTRIBUTE_NAME: {
      const attr = parseElementFromChar({ char, fragment, part, parents, nextPart });
      parents.setAttr(attr);
      break;
    }
    case PARTS.ATTRIBUTE_VALUE:
      const attrValue = parseElementFromChar({ char, fragment, part, parents, nextPart });
      parents.setAttrValue(attrValue);
      break;
    case PARTS.CLOSING_TAG:
      parents.remove();
      break;
    case PARTS.ELEMENT:
      break;
    case PARTS.TEXT_NODE: {
      const textNode = parseElementFromChar({ char, fragment, part, parents, nextPart });
      parents.top.addTextNode(textNode);
      break;
    }
    case PARTS.RAW_TEXT_ELEMENT: {
      parents.top.setRawText(fragment.slice(0, -1));
      break;
    }
  }
  return nextPart;
}
type ParsableParts = Extract<
  Part,
  'TAG_NAME' | 'ATTRIBUTE_NAME' | 'ATTRIBUTE_VALUE' | 'TEXT_NODE' | 'RAW_TEXT_ELEMENT'
>;
type ParseCharElOpt = { fragment: string; part: ParsableParts };
type ParsedElement<T extends ParsableParts> = T extends 'TAG_NAME' ? HTMLElement
  : T extends 'ATTRIBUTE_NAME' ? Attr
  : T extends 'ATTRIBUTE_VALUE' | 'RAW_TEXT_ELEMENT' ? string
  : T extends 'TEXT_NODE' ? Text
  : never;
// type ParsedElement = string | Attr | HTMLElement | Text;
function parseElementFromChar<T extends ParsableParts>(
  fragment: string,
  part: T,
): ParsedElement<T> {
  switch (part) {
    case PARTS.TAG_NAME: {
      return createElement(
        fragment.trim().replace(tagStart, '').replace(closeElementShorthand, ''),
      ) as ParsedElement<T>;
    }
    case PARTS.ATTRIBUTE_NAME: {
      return createAttribute(fragment.trim().replace('=', '')) as ParsedElement<T>;
    }
    case PARTS.ATTRIBUTE_VALUE:
      if (`'"`.includes(fragment.at(0)!)) {
        return fragment.slice(1, -1) as ParsedElement<T>;
      }
      return fragment as ParsedElement<T>;
    case PARTS.TEXT_NODE: {
      return createTextNode(fragment.slice(0, -1)) as ParsedElement<T>;
    }
    case PARTS.RAW_TEXT_ELEMENT: {
      return fragment.slice(0, -1) as ParsedElement<T>;
    }
    default: {
      return isWeakNever(part);
    }
  }
}

function parseChar({ char, fragment, part, parents }: ParseCharOpt): Part {
  const nextPart = getNextPart(char, fragment, part);

  if (nextPart === part) return nextPart;

  switch (part) {
    case PARTS.PARENT:
      break;
    case PARTS.TAG_NAME: {
      if (nextPart === PARTS.CLOSING_TAG) {
        break;
      }
      const newTag = createElement(
        fragment.trim().replace(tagStart, '').replace(closeElementShorthand, ''),
      );
      parents.top.addChild(newTag, { withChildren: nextPart !== PARTS.PARENT });
      break;
    }
    case PARTS.TAG:
      if (nextPart === PARTS.PARENT) parents.remove();
      break;
    case PARTS.ATTRIBUTE_NAME: {
      parents.setAttr(createAttribute(fragment.trim().replace('=', '')));
      break;
    }
    case PARTS.ATTRIBUTE_VALUE:
      if (`'"`.includes(fragment.at(0)!)) {
        fragment = fragment.slice(1, -1);
      }
      parents.setAttrValue(fragment);
      break;
    case PARTS.CLOSING_TAG:
      parents.remove();
      break;
    case PARTS.ELEMENT:
      break;
    case PARTS.TEXT_NODE: {
      const textNode = createTextNode(fragment.slice(0, -1));
      parents.top.addTextNode(textNode);
      break;
    }
    case PARTS.RAW_TEXT_ELEMENT: {
      parents.top.setRawText(fragment.slice(0, -1));
      break;
    }
  }
  return nextPart;
}
