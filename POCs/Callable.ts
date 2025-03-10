export class Callable extends Function {
  constructor() {
    super();
    return new Proxy(this, {
      apply: (target, thisArg, args) => target._call(...args),
    });
  }

  _call(...args: any[]): any {
    console.log(this, args);
  }
}
