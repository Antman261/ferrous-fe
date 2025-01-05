import { makeConstEnum } from '@ferrous/util';
export const PARTS = makeConstEnum(
  [
    'TAG_NAME', // Inside a tag, but not past the name: <|-|tag>, <t|-|ag>
    'TAG', // <tag |-|>, <tag |-|attr>
    'CLOSING_TAG', // Inside a closing tag, but not yet complete: </|-|tag>, </t|-|ag>, </|-|>
    'ATTRIBUTE_NAME', // inside an attribute name: <tag c|-|lass="my value">
    'ATTRIBUTE_VALUE', // inside an attribute value: <tag class="|-|my value">
    'ELEMENT', // inside an element body: <tag[ attrs]>|-|</tag>
    'TEXT_NODE', // inside an element, after some text: <tag[ attrs]>any text |-|</tag>
    'RAW_TEXT_ELEMENT', // plain text elements like <script>, <textarea>
    'PARENT', // a parent is an element, including host (the template)
  ] as const,
);
export type Part = keyof typeof PARTS;

export const tagStart = '<';
export const tagEnd = '>';
export const closingTagStart = '</';
export const whiteSpace = ' \n\t\r';
export const rawTextTags = ['<script', '<style', '<textarea', '<title'] as const;
export const closeElementShorthand = `/>`;
