const runtime: Record<string, () => Document> = {
  'browser': () => globalThis.document,
};

export function getDoc(): Document {
  return runtime['browser']();
}
