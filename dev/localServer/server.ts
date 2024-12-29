import { serveDir } from '@std/http/file-server';
import { doesJsFileExist, isJsFile, processTsFile } from './fileProcessing.ts';

type Opt = {
  port: number;
};

const defaultOpts = { port: 8337 } as const satisfies Opt;

export const startServer = ({ port }: Opt = defaultOpts): void => {
  Deno.serve({ port }, async (req) => {
    const { pathname } = new URL(req.url);

    if (isJsFile(pathname)) {
      if (await doesJsFileExist(pathname) === false) {
        await processTsFile(pathname);
      }
    }

    return serveDir(req);
  });
};

// function logError(error: Error) {
//   // deno-lint-ignore no-console
//   console.error(`%c${error.message}`, "color: red");
// }
