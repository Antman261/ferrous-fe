import { expect } from '@std/expect';
import { delay } from '@std/async';
import { launch } from '@astral/astral';
import { startServer, stopServer } from '@ferrous/serve';
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

Deno.test('css: in browser', async (t) => {
  const [browser] = await Promise.all([
    launch(),
    startServer({ port: 3030 }),
  ]);
  await delay(20_000);
  const page = await browser.newPage('http://0.0.0.0:3030/test_fixtures/index.html');
  await t.step('adds a global style sheet', async () => {
    // Run code in the context of the browser
    const value = await page.evaluate(() => {
      css.global`div { padding: 10px; }`;
      return document.body.querySelectorAll('style');
    });
    console.log(value);
  });
  await Promise.all([browser.close(), stopServer]);
});
