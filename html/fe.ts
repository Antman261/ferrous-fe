import { TemplateFunc } from './tag.ts';
import { Attributes } from './attrs.ts';
import { html } from './html.ts';
import { Obj } from './util.ts';

/**
 * An HTMLElement instance extended with FerrousFE utilities to improve developer usability.
 *
 * For example, to create and then change a button's text:
 *
 * ```example
 * const button = btn`Click me!`.on('click', button.do.txt`Thanks!`);
 * body.push`<div class='btn-bar'>${button1}</div>`;
 * ```
 *
 * By contrast, in vanilla javascript this is:
 *
 * ```ts
 * const button = document.createElement('button');
 * button.innerHTML = 'Click me!';
 * button.onclick = () => button.innerHTML = 'Thanks!';
 *
 * const div = document.createElement('div');
 * div.class = 'btn-bar';
 * div.appendChild(button)
 * document.body.appendChild(div);
 * ```
 */
export type FeHTMLElement<T extends HTMLElement = HTMLElement> = FeElement<T> & T;
export type FeElement<T> = {
  html: TemplateFunc<T, Node>;
  txt: TemplateFunc<T>;
  // do: LazyFactory<T>; todo: implement this -- getting `do` returns a lazy function whose behavior is defined by calls to its methods, and its methods return references to itself instead of performing the action
  // style: TemplateFunc<T, (attrs: Attrs) => string>;
  // clone: () => T;
};
export type FHElement = FeHTMLElement;

export type FeFunc = (attrs?: Obj) => FeComponent;

export interface FeComponent extends HTMLElement {
  setStyle: (value: string) => void;
}

export function fe<T extends Attributes>(
  feFunc: FeFunc,
  attrs?: T,
): TemplateFunc<FeComponent, Node> {
  return (strings, ...fields) => {
    let style: HTMLStyleElement;
    const basicElement: FeComponent = {
      ...html(strings, ...fields),
      setStyle: (styles) => {
        if (!style) {
          style = document.createElement('style');
          style.textContent = styles;
          basicElement.appendChild(style);
        }
      },
    };
    // add enhancements
    basicElement.setStyle =
      basicElement.toString =
        (): string => {
          return `<${feFunc.name}>${attrs?.children ?? ''}</${feFunc.name}>`;
        };
    return basicElement;
  };
}
