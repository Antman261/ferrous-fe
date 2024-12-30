export type ExtractMatchingProperties<T, V> = {
  [K in keyof T]: T[K] extends V ? T[K] : never;
};

export type Obj<T = unknown> = Record<string | number | symbol, T>;
export const mergeObjects = <A extends {}, B, C = unknown>(
  a: A,
  b: B,
  c?: C,
): A & B & C => Object.assign(a, b, c);

export const makeCallableObject = <F extends Function, O extends Obj>(f: F, o: O): F & O =>
  Object.assign(f, o);

// from styled-components
// function generateId(
//   displayName?: string | undefined,
//   parentComponentId?: string | undefined,
// ): string {
//   const name = typeof displayName !== 'string' ? 'sc' : escape(displayName);
//   // Ensure that no displayName can lead to duplicate componentIds
//   identifiers[name] = (identifiers[name] || 0) + 1;

//   const componentId = `${name}-${
//     generateComponentId(
//       // SC_VERSION gives us isolation between multiple runtimes on the page at once
//       // this is improved further with use of the babel plugin "namespace" feature
//       SC_VERSION + name + identifiers[name],
//     )
//   }`;

//   return parentComponentId ? `${parentComponentId}-${componentId}` : componentId;
// }
