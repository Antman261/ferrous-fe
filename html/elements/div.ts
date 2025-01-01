import { html } from '../html.ts';
import { Statics } from '../tag.ts';

export const div = (strings: Statics, ...fields: Node[]) =>
  html<HTMLDivElement>`<div></div>`.append(strings, ...fields);
