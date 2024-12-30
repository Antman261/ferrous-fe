import { Attribute } from './attrs.ts';
import { HElement } from './dom.ts';
import { FeElement, FeHTMLElement } from './fe.ts';
import { getRawText, Statics } from './tag.ts';
import { fromTemplate, getTemplate } from './template.ts';
import { mergeObjects } from './util.ts';

export function html<T extends HElement = HElement>(
  strings: Statics,
  ...fields: Array<Node | Attribute>
): FeHTMLElement<T> {
  // todo: need to parse strings for HTML element strings, turn them into elements, and then append any subsequent child fields
  const element: FeHTMLElement<T> = mergeObjects<T, FeElement<T>>(
    fromTemplate<T>(getTemplate(strings, fields)),
    {
      html: (strings, ...fields) => {
        element.appendChild(html(strings, ...fields));
        return element;
      },
      txt: (strings, ...fields) => {
        element.textContent = getRawText(strings, ...fields);
        return element;
      },
    },
  );
  for (const field of fields) {
    if (field instanceof Node) element.appendChild(field);
  }
  return element;
}
