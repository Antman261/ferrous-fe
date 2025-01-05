import { getDoc, Primitive } from '@ferrous/util';
import { Statics } from '../tag.ts';
import { closeElementShorthand, Part, PARTS, tagStart } from './constants.ts';
import { getNextPart } from './nextPartMap.ts';
import { cloneChildren } from './cloneChildren.ts';
// import { CtxArgs, getActiveContext } from '../ctx.ts';
import { initParentStack, ParentStack } from './initParentStack.ts';

const { createElement, createTextNode, createAttribute } = getDoc();

type Value = Exclude<Primitive, symbol> | (() => Value) | HTMLElement | HTMLCollection | Attr | Text;

const template = createElement('template');
export function tagToHtmlElements(strings: Statics, values: Value[]): HTMLElement[] {
  // todo: load parsed statics from context cache for efficient re-render
  //   const ctx = getActiveContext();
  const parents = initParentStack(template);
  let part: Part = PARTS.PARENT;

  let arrayPos = 0;
  const arrayEnd = strings.length;

  while (arrayPos < arrayEnd) {
    const [string, value] = [strings[arrayPos], values[arrayPos]];

    part = parseString({ string, parents, part });
    part = parseValue({ value, parents, part });

    arrayPos++;
  }
  return cloneChildren(template);
}

type ParseValueOpt = {
  value: Value;
  part: Part;
  parents: ParentStack;
};
function parseValue({ value, parents, part }: ParseValueOpt) {
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
      }
      if (value instanceof Text) {
        parents.top.addTextNode(value);
      }
      if (value instanceof HTMLElement) {
        parents.top.addChild(value, { withChildren: false });
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
