#!/usr/bin/env -S deno run --allow-net --allow-read
import { parseArgs } from "@std/cli";
import { startServer } from "./server.ts";

if (import.meta.main) {
  main();
}

function main(): void {
  const { port, help } = parseArgs(Deno.args, {
    boolean: ["help"],
    default: {
      port: 8337,
    },
    alias: {
      p: "port",
      h: "help",
    },
  });
  if (help) {
    printUsage();
    Deno.exit();
  }
  startServer({ port: Number(port) });
}

function printUsage(): void {
  // deno-lint-ignore no-console
  console.log(`FerrousFE Local Development Server
  Serves FerrousFE locally for development.

USAGE:
  fe-serve [options]

OPTIONS:
  -h, --help            Prints help information
  -p, --port=<PORT>     Set port (default is 8337)
  -V, --version         Print version information
`);
  /*   
INSTALL:
  deno install --allow-net --allow-read --allow-sys jsr:@ferrous/serve@${denoConfig.version}/fe-serve 
*/
}
