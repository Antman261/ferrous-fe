import { serveDir } from '@std/http/file-server';
import { join } from '@std/path/join';
import { doesJsFileExist, isJsFile, processTsFile } from './fileProcessing.ts';

type Opt = {
  port: number;
  fsRoot?: string;
  urlRoot?: string;
};

const defaultOpts = { port: 8337 } as const satisfies Opt;
let server: Deno.HttpServer | void;

export const startServer = ({ port, fsRoot, urlRoot }: Opt = defaultOpts): void => {
  if (server) return console.warn('Server is already running');
  server = Deno.serve({ port }, async (req) => {
    const { pathname } = new URL(req.url);
    const fsPath = join('./', fsRoot ?? '', pathname);
    const urlPath = join(urlRoot ?? '', pathname);

    if (isJsFile(urlPath)) {
      if (urlPath.endsWith('main.js')) {
        await processTsFile(fsPath);
      }
    }

    return serveDir(req, { fsRoot, urlRoot });
  });
};

export const stopServer = async (): Promise<void> => {
  if (!server) return console.warn('Server already closed');
  server = await server.shutdown();
};

// function logError(error: Error) {
//   // deno-lint-ignore no-console
//   console.error(`%c${error.message}`, "color: red");
// }
