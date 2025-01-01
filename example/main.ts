import { btn, css, div, Element, fender, html, mergeObjects } from '@ferrous/fe';

css.global`p { padding: 15px; color: #338; }`;

const SquareApp = () => {
  const addBtn = btn`Add custom-square to DOM`;
  const updateBtn = btn`Update attributes`.attr`disabled`;
  const removeBtn = btn`Remove custom-square from DOM`.attr`disabled`;
  const square = CustomSquare({ size: '100', color: 'red' });
  addBtn.onclick = () => {
    square.spawn();
    addBtn.disabled = true;
    updateBtn.disabled = false;
    removeBtn.disabled = false;
  };
  updateBtn.onclick = square.randomize;
  removeBtn.onclick = () => {
    square.remove();
    addBtn.disabled = false;
    updateBtn.disabled = true;
    removeBtn.disabled = true;
  };

  return div`
      ${div`${addBtn}${updateBtn}${removeBtn}`}
      ${square}
    `;
};

type Attrs = { size: string; color: string };
type CustomSquareMethods = {
  spawn: () => void;
  randomize: () => void;
};

const CustomSquare = (attrs: Attrs) => {
  const main: Element<HTMLElement> & CustomSquareMethods = mergeObjects(html`<div></div>`, {
    spawn: () => {
      main.randomize();
      setStyles();
    },
    randomize: () => {
      const [r, g, b] = [random(0, 255), random(0, 255), random(0, 255)];
      main.attr`size="${random(50, 200)}" color="rgb(${r},${b},${g})"`;
    },
  }); // empty node?
  const setStyles = () => {
    const { size, color } = main.getAttrs();
    main.attr`style="width:${size}px;height:${size}px;background-color:${color};"`;
    // todo: replace with main.css`{ width: ${size}px; height: ${size}px; background-color: ${color}; }`
  };

  //   main.onAttributeChanged = setStyles;
  return main;
};

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

fender(SquareApp());
