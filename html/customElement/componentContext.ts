import { Part } from '../parse/constants.ts';
import { ParentStack } from '../parse/initParentStack.ts';
import { Value } from '../parse/tagToHTML.ts';

export type ComponentContext = {
  name: string;
  isUnrenderedInstance: boolean;
  isFirstInstanceOfComponent: boolean;
  parseValueCallCache: [number, Part][];
  shadowRoot: ShadowRoot;
  previousUpdateValues: Value[];
  parents?: ParentStack;
};
type Opt = { name: string };
const componentNames = new Set<string>();
export const makeComponentContext = ({ name }: Opt, shadowRoot: ShadowRoot): ComponentContext => {
  const isFirstInstanceOfComponent = componentNames.has(name) === false;
  componentNames.add(name);
  return {
    name,
    isUnrenderedInstance: true,
    parseValueCallCache: [],
    shadowRoot,
    get isFirstInstanceOfComponent() {
      return isFirstInstanceOfComponent;
    },
    previousUpdateValues: [],
  };
};
