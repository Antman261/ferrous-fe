* html5 templates https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts
* https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id
Elements with ID attributes are available as global properties. The property name is the ID attribute,
 and the property value is the element. For example, given markup like:

HTML
Copy to Clipboard
<p id="preamble"></p>
You could access the paragraph element in JavaScript using code like:

JS
Copy to Clipboard
const content = window.preamble.textContent;

* https://www.abstractsyntaxseed.com/blog/defining-asts-with-dynamic-classes-in-javascript
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#improve_caching_by_mapping_away_hashed_filenames


## API Brainstorming

```typescript
import { asCustomElement } from '@ferrous/fe';

asCustomElement({
  name: 'click-counter',
  styles: css`:host { background-color: aqua; }`,
}, () => {
  const count = 0;
  const incrementCount = () => count++;
  return () => html`
    <slot></slot>
    <div class="card">
        ${btn`Count: ${count}`.onClick(incrementCount)}
    </div>`;
});
```

The above would require `click-counter` to subscribe to events from it's children and trigger a re-render.

An alternative:

```typescript
import { asCustomElement } from '@ferrous/fe';

asCustomElement({
  name: 'click-counter',
  styles: css`:host { background-color: aqua; }`,
  localState: { count: 0 },
  publicAttrs: { maxCount: 10 },
}, (state, attrs) => {
  const incrementCount = () => {
    if (state.count === maxCount) return;
    state.count += 1;
  };
  return {
    onAttrUpdate: () => {
      state.count  = Math.min(state.count, attrs.maxCount);
    },
    render: () => html`
    <slot></slot>
    <div class="card">
        ${btn`Count: ${state.count}`.onClick(incrementCount)}
    </div>`
  };
});
```

This would allow Ferrous to Proxy `localState` and automatically update on change. We could even wrap 
the `count` value in an object with `toString` overridden, so that it becomes an HTML Element like 
`<number value="1" />` when used in `html` and automatically updated when changed, without triggering 
a full re-render

* only components can change their internal state; never their parents
* only a parent can change a component's attributes; never itself

On attr/state change:

* setter calls component's queueUpdate method
* compare new/old values, if changed: add the component's render function to Set: `renderingQueue`
* every `requestAnimationFrame`, the renderer calls every function in `renderingQueue` and clears it once completed