import { expect } from '@std/expect';
import { withBrowser } from '../test/util.ts';

Deno.test(
  'template',
  withBrowser(async ({ runInPage, t }) => {
    await t.step('transforms a template string into a html tree', async () => {
      const value = await runInPage(() => {
        const { html, css } = getFerrous();
        const maxedStyle = css.style`.card { background-color: aqua; }`;
        const r = html``;
      });
    });
  }),
);
