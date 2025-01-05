import { Statics } from './tag.ts';
import { tagFnToText, TemplateFunc } from './tag.ts';
import { makeCallableObject } from './util.ts';

type FeCss = TemplateFunc<string, unknown> & {
  global: TemplateFunc<void, unknown>;
  style: TemplateFunc<HTMLStyleElement, unknown>;
};

export const css: FeCss = makeCallableObject(
  (statics: Statics, ...fields: unknown[]): string => tagFnToText(statics, ...fields),
  {
    global: (statics: Statics, ...fields: unknown[]) => {
      const styleElement = makesStyleElement(statics, fields);
      document.body.appendChild(styleElement);
    },
    style: (statics: Statics, ...fields: unknown[]) => makesStyleElement(statics, fields),
  },
);

function makesStyleElement(statics: Statics, ...fields: unknown[]) {
  const styleElement = document.createElement('style');
  styleElement.textContent = tagFnToText(statics, ...fields);
  return styleElement;
}
