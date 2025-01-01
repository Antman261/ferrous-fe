import { html } from '../html.ts';
import { Statics } from '../tag.ts';

export const btn = (strings: Statics, ...fields: unknown[]) =>
  html<HTMLButtonElement>`<button></button>`.txt(strings, fields);
