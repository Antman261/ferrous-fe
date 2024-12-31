import { expect } from '@std/expect';
import { getFerrous, withBrowser } from '../test/util.ts';
import { css } from './css.ts';

Deno.test('css', async (t) => {
  await t.step('returns plain text without modification', () => {
    const res = css`div { padding: 10px; }`;
    expect(res).toBe(`div { padding: 10px; }`);
  });
  await t.step('inserts primitive values: 10', () => {
    const res = css`div { padding: ${10}px; }`;
    expect(res).toBe(`div { padding: 10px; }`);
  });
  await t.step(`inserts primitive values: '10px'`, () => {
    const res = css`div { padding: ${'10px'}; }`;
    expect(res).toBe(`div { padding: 10px; }`);
  });
  await t.step(`inserts variables with primitive values: '10px'`, () => {
    const v = '10px';
    const res = css`div { padding: ${v}; }`;
    expect(res).toBe(`div { padding: 10px; }`);
  });
  await t.step(`inserts variables with primitive values: 10`, () => {
    const v = 10;
    const res = css`div { padding: ${v}px; }`;
    expect(res).toBe(`div { padding: 10px; }`);
  });
  await t.step(`inserts objects using their toString method`, () => {
    const v = { toString: () => 10 };
    const res = css`div { padding: ${v}px; }`;
    expect(res).toBe(`div { padding: 10px; }`);
  });

  // todo: css should perhaps support style elements
});

Deno.test(
  'css: in browser',
  withBrowser(async ({ runInPage, t }) => {
    await t.step('adds a global style sheet', async () => {
      const value = await runInPage(() => {
        const { css } = getFerrous();
        css.global`div { padding: 10px; }`;
        // deno-lint-ignore no-undef
        const r = document!.body.querySelectorAll('style')[0].innerText;
        return r;
      });
      expect(value).toBe(`div { padding: 10px; }`);
    });
  }),
);
