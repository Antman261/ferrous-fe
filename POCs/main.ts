import { AttrOf, css, fe, fender, html, Statics } from './ferrous.ts';

const btn = (attrs?: AttrOf<HTMLButtonElement>) => html<HTMLButtonElement>`<button ${attrs}></button>`;
btn.txt = (statics: Statics, ...fields: unknown[]) => btn().txt(statics, fields);

const SquareApp = () => {
  // const addBtn = html<HTMLButtonElement>`<button>Add custom-square to DOM</button>`;
  // const updateBtn = html<HTMLButtonElement>`<button disabled>Update attributes</button>`;
  // const removeBtn = html<HTMLButtonElement>`<button disabled>Remove custom-square from DOM</button>`;
  const addBtn = btn.txt`Add custom-square to DOM`;
  const updateBtn = btn({ disabled: true }).txt`Update attributes`;
  const removeBtn = btn({ disabled: true }).txt`Remove custom-square from DOM`;
  const square = CustomSquare({ size: '100', color: 'red' });
  addBtn.onclick = () => {
    square.spawn();
    addBtn.disabled = true;
    updateBtn.disabled = false;
    removeBtn.disabled = false;
  };
  updateBtn.onclick = square.randomize;
  removeBtn.onclick = () => {
    square.destroy();
    addBtn.disabled = false;
    updateBtn.disabled = true;
    removeBtn.disabled = true;
  };

  return fe(SquareApp)`
      ${html`<div>${addBtn}${updateBtn}${removeBtn}</div>`}
      ${square}
    `;
};

type Attrs = { size: string; color: string };

const CustomSquare = (attrs: Attrs) => {
  const main = fe(CustomSquare, attrs)``; // empty node?
  const setStyles = () => {
    const { size, color } = main.getAttrs();
    main.setStyle(
      css`div {
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
      }`,
    );
  };

  main.spawn = () => {
    setStyles();
    main.appendChild(html`<div></div>`);
  };

  main.randomize = () => {
    main.setAttributes({
      size: `${random(50, 200)}`,
      color: `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
    });
  };

  main.onAttributeChanged = setStyles;

  return main;
};

fender({
  head: html`
      <title>Life cycle callbacks test</title>
      <style>
        custom-square {
          margin: 20px;
        }
      </style>`,
  body: html`
      <h1>Life cycle callbacks test</h1>
      ${SquareApp()}`,
});

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
