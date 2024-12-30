import * as esbuild from 'esbuild';

const isJsFile = (path: string): boolean => path.endsWith('.js') || path.endsWith('.ts');

const processed = new Set<string>();

const doesJsFileExist = async (path: string): Promise<boolean> =>
  processed.has(path) || await doesFileExist(path);

const doesFileExist = async (path: string): Promise<boolean> => {
  try {
    await Deno.lstat(`${path}`);
    processed.add(path);
    return true;
  } catch {
    return false;
  }
};

const processTsFile = async (path: string): Promise<void> => {
  const filepath = `${path}`;
  const file = await Deno.readFile(filepath.replace('.js', '.ts'));
  const transpiled = await esbuild.build({ bundle: true });
  //await Deno.writeTextFile(filepath, transpiled.code);
  processed.add(path);
};

export { doesJsFileExist, isJsFile, processTsFile };
