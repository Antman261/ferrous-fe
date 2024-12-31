import { Browser, launch } from '@astral/astral';
import { delay } from '@std/async';
import { Fn, Px } from '@ferrous/util';
import * as fe from '../html/mod.ts';
import { startServer, stopServer } from './testServer.ts';

type Fe = typeof fe;

type Context = { browser: Browser; runInPage: <T>(fn: Fn<T>) => Px<T>; t: Deno.TestContext };
type WrappedFn = (context: Context) => Px<void>;
type TestCaseFn = (t: Deno.TestContext) => Px<void>;

export const withBrowser = (fn: WrappedFn): TestCaseFn => async (t: Deno.TestContext): Px<void> => {
  const [browser] = await Promise.all([launch(), startServer()]);
  const runInPage = async <T>(fn: Fn<T>): Px<T> => {
    const page = await browser.newPage('http://localhost:3030');
    try {
      return await page.evaluate(fn);
    } finally {
      await page.close();
    }
  };

  try {
    await fn({ browser, runInPage, t });
  } finally {
    await Promise.all([browser.close(), stopServer()]);
  }
};

// deno-lint-ignore no-explicit-any
export const getFerrous = (): Fe => (window as unknown as any).fe as Fe;
