import deno from '@deno/vite-plugin';
import { createServer, ViteDevServer } from 'vite';

let server: ViteDevServer | void;
let server2: ViteDevServer | void;
export const startServer = async (): Promise<void> => {
  if (server) return console.warn('DevServer is already running');
  server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: './test/fixtures',
    plugins: [deno()],
    server: {
      port: 3030,
    },
  });
  server2 = await server.listen();

  server.printUrls();
};

export const stopServer = async (): Promise<void> => {
  if (!server) return console.warn('DevServer already closed');
  await server.close();
  if (server2) {
    // I'm not sure why this helps, but deno complains about leaks without it
    await server2.close();
  }
  server = undefined;
  server2 = undefined;
};
