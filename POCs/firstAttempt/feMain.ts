// deno-lint-ignore-file
import { ftml as html, makeElement } from './frameworkPOC.ts';
import { z } from 'zod';

const Button = makeElement(z.object({
   onClick: z.function(),
}), )

makeElement(
  z.object({
    isFoo: z.boolean(),
  }),
    () => {
        const { counter } = fe.getState();
        const incrementCounter = fe.registerCommand(
            'incrementCounter',
            (_e: PointerEvent, state) => {
                if (state.counter > 10) {
                    fe.dispatchEvent('counter-limit-reached');
                    return;
                }
                fe.dispatchEvent('counter-incremented');
            },
        );
        return ({ isFoo }) => {
            // logic
            const fooClass = isFoo ? 'foo' : 'bar';

            const ob = fe.observed({ fooClass, counter });

            return [
                ob,
                html`
                <div class="${ob.fooClass}">
                    <p>Hello world!</p>
                    <p>Counter: ${ob.counter}</p>
                    ${Button({ onClick: incrementCounter})}
                    <button onclick=${incrementCounter}>
                </div>
            ];
        },
    }
);
