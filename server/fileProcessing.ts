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
  const filepathTs = filepath.replace('.js', '.ts');
  if (filepathTs.endsWith('main.ts')) {
    await esbuild.build({
      bundle: true,
      entryPoints: [filepathTs],
      outdir: filepathTs.replace('main.ts', ''),
      platform: 'neutral',
    });
    return;
  }
  // const file = await Deno.readFile(filepathTs);
  // const transpiled = await esbuild.transform(file, { loader: 'ts', platform: 'neutral' });
  // await Deno.writeTextFile(filepath, transpiled.code);
  // processed.add(path);
};

export { doesJsFileExist, isJsFile, processTsFile };
