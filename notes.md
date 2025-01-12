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
    render: () =>
      html`
        <slot></slot>
        <div class="card">
            ${btn`Count: ${state.count}`.onClick(incrementCount)}
        </div>
    `,
  };
});
```

This would allow Ferrous to trap `localState` and automatically update on change. 

* only components can change their internal state; never their parents
* only a parent can change a component's attributes; never itself.
  * however: it's best to treat attributes as initialisers; access mutable properties shared between components via app state

On attr/state change:

* setter calls component's `enqueueUpdate` method
* compare new/old values, if changed: add the component's render function to Set: `renderingQueue`
* every `requestAnimationFrame`, the renderer calls every function in `renderingQueue` and clears it once completed

Don't pass data between custom components. Don't hoist state. Prefer global state.

Attributes:

* camelCase in javascript, kebab-case in html.

Shadow Root:

a Component's template is rendered using its shadow root: Styles are scoped to shadow root

Inheritance:

* Don't bother! Just share styles etc as values or functions when needed

Styles:

* https://lit.dev/docs/components/styles/#using-unicode-escapes-in-styles
* https://lit.dev/docs/components/styles/#slotted
* https://lit.dev/docs/components/styles/#style-element

Theming:

* https://developer.mozilla.org/en-US/docs/Web/CSS/Inheritance
* https://developer.mozilla.org/en-US/docs/Web/CSS/--*

Example with all properties and features:

```typescript
import { defineCustomElement } from '@ferrous/fe';

const clickCounter = defineCustomElement({ // runs once when a new custom element is defined (technically immediately before it is defined)
  name: 'click-counter', // must be globally unique, required when using an anonymous function definition
  styles: css`:host { background-color: aqua; }`, // exists in shadow-dom, shared amongst all instances
  localState: { count: 0 }, // copied per instance
  publicAttrs: { maxCount: 10 }, // default value if undefined, automatically observed, calls onAttrUpdate when changed via markup
}, 
// this function runs once per instance when it is mounted to the DOM
({ local, attrs, global, enqueueUpdate }) => { // never destructure local, attrs, or global 
  global.notify('user', enqueueUpdate); // subscriptions to global state must be explicitly defined: how FerrousFe avoids needing a virtual dom & renderer 

  const isMaxed = () => local.count >== attrs.maxCount;
  const isEven = () => local.count % 2 === 0;
  const getStatus = () => local.count === 0 ? 'STOPPED' : isMaxed() ? 'MAXXED' : 'COUNTING';
  const incrementCount = () => {
    if (isMaxed()) return;
    local.count += 1;
  };

  const maxedStyle = css.style`.card { background-color: aqua; }`;
  return {
    onAttrUpdate: () => { // called after attributes updated but before render
      local.count  = Math.min(local.count, attrs.maxCount);
    },
    render: () => { 
      /* render is called when:
          * the element is defined - to create the template children in the shadow-dom
          * the element is instantiated in the DOM, required if attrs are not default
          * attributes have changed
          * component state has changed
          * global state has changed 
        
        never define a function inside render! 
      */
      const { count } = local; 
      // safe to destructure inside render, provided handler functions are defined in instance; never update in render fn
      const cardClass = attr.class(['card', isEven() && 'even']);
      // makes valid class string: 'class="card even"' | 'class="card"'
      return template`
        ${onTrue(isMaxed(), maxedStyle)}
        <slot></slot> ${/* Children go here. Components can have 0..n slots */}
        <p>Hello ${global.user?.name ?? 'there!'}</p>
        ${onTrue(
          attrs.showMetadata, 
          onCase(getStatus(), [
            ['STOPPED', () => span`<strong>Status: </strong> Stopped`],
            ['MAXXED', () => span`<strong>Status: </strong> Maximum reached @ ${local.count}`],
            ['COUNTING', () => span`<strong>Status: </strong> Counting...`],
          ], () => h2`Error!`)
        )}
        <div ${cardClass}>
            ${btn`Count: ${count}`.onClick(incrementCount)}
        </div>`
    },
  };
});

const main = defineCustomElement({}, function main() { // component name 'main' taken from function name
  return { render: () => html`<click-counter max-count="12" />` };
});

// alternatively
const main = defineCustomElement({ name: 'main' }, () => ({ render: () => html`<${clickCounter({ maxCount: 12 })} />` }));

// with children
const main = defineCustomElement({ name: 'main' }, () => ({ 
  render: () => html`
      <${clickCounter({ maxCount: 12 })}>
        <h1>Welcome to Click Counter 😎</h1>
      </click-counter>`,
}));

// another alternative with children
const main = defineCustomElement({ name: 'main' }, () => ({ 
  render: () => html`
      <click-counter max-count="12">
        <h1>Welcome to Click Counter 😎</h1>
      </click-counter>`,
}));

document.body.appendChild(html`<main />`);
document.body.appendChild(main());
```

```typescript
import { defineCustomElement } from '@ferrous/fe';

const clickCounter = defineCustomElement({ 
  name: 'click-counter', 
  styles: css`:host { background-color: aqua; }`,
  localState: { count: 0 }, // only primitives: flatten complex objects
  publicAttrs: { maxCount: 10, showMetadata: false },
}, 
({ local, attrs, global, enqueueUpdate, shadowRoot }) => {
  global.user.onUpdate(enqueueUpdate); // automatically cleaned on disconnect

  const isMaxed = () => local.count >== attrs.maxCount;
  const isEven = () => local.count % 2 === 0;
  const getStatus = () => local.count === 0 ? 'PENDING' : isMaxed() ? 'DONE' : 'OPEN';
  const incrementCount = () => {
    if (isMaxed()) return;
    local.count += 1;
  };

  const maxedStyle = css.style`.card { background-color: aqua; }`;
  return {
    onAttrUpdate: () => {
      local.count = Math.min(local.count, attrs.maxCount);
    },
    render: () => {
      const { count, showMetadata } = { ...local, ...attrs }; 
      const cardClass = attr.class(['card', isEven() && 'even'])/* Attr */;

      return template`
        ${isMaxed() ? maxedStyle : null/* StyleElement | null */}
        <slot></slot>y
        <p>Hello ${global.user?.name ?? 'there!'}</p>
        ${onTrue(
          showMetadata, 
          onCase(getStatus(), [
            ['PENDING', () => span`<strong>Status: </strong> Stopped`],
            ['DONE', () => span`<strong>Status: </strong> Max reached @ ${count}`],
            ['OPEN', () => span`<strong>Status: </strong> Counting...`],
          ], h2`Error!`)
        )/* element; expression is fully executed each render */}
        <div ${cardClass/* Attr */}>
            ${btn`Count: ${count}`.onClick(incrementCount)/* element: replaced each render */}
        </div>`
    },
    onDisconnect: () => { /* cleanup, e.g. window.removeEventListener */ }
  };
});
```

State system:
* one big state object
* every object is proxied with a set trap, which emit events every time a property is set
* allows every custom element to define which parts of state to subscribe to