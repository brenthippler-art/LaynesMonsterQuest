import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { circle, ellipse, n, type Pen, shape } from './pen';

/**
 * Newer feet and the claw arms. Toes and claws are little ROUND bumps (friendly, never pointy).
 *   claws   chunky feet with three round toes
 *   hooves  rounded feet with a dark hoof at the bottom
 *   wheels  a tire with a light hub (shopping carts, wagons, robots)
 * Bodies with legs built in (beast, bird, dragon...) say where their legs are (b.feetX).
 */
export type CreatureFeet = 'claws' | 'hooves' | 'wheels';

const HOOF = '#503000';
const TIRE = '#7C7C7C';
const HUB = '#FCFCFC';

/** Feet sit behind the body, like the older feet, so only their bottoms peek out. */
export function drawCreatureFeet(pen: Pen, b: Body, style: CreatureFeet, c: Palette): string {
  const color = c.feet ?? c.main;
  const y = b.bottom;
  const xs = b.feetX ?? [CENTER_X - b.rx * 0.42, CENTER_X + b.rx * 0.42];
  return xs
    .map((x) => {
      switch (style) {
        case 'claws':
          return ellipse(pen, x, y - 1, 14, 9, color) + [-8, 0, 8].map((dx) => circle(pen, x + dx, y + 5 + (dx ? 0 : 1.5), 4.5, c.belly)).join('');
        case 'hooves':
          return (
            ellipse(pen, x, y - 6, 10, 10, color) +
            shape(pen, `M${n(x - 10)} ${n(y - 3)} L${n(x + 10)} ${n(y - 3)} L${n(x + 10)} ${n(y + 4)} Q${n(x + 10)} ${n(y + 7)} ${n(x + 7)} ${n(y + 7)} L${n(x - 7)} ${n(y + 7)} Q${n(x - 10)} ${n(y + 7)} ${n(x - 10)} ${n(y + 4)} Z`, c.feet ?? HOOF)
          );
        case 'wheels':
          return circle(pen, x, y, 12, TIRE) + circle(pen, x, y, 5, HUB, { shade: false });
      }
    })
    .join('');
}

/** A short, thick arm with three round claws at the end (drawn in front of the body). */
export function drawClawArm(pen: Pen, x: number, ay: number, side: number, c: Palette): string {
  const tipX = x + side * 11;
  const tipY = ay + 14;
  return (
    ellipse(pen, x + side * 4, ay + 3, 9, 15, c.main, -side * 30) +
    [-5, 0, 5].map((d) => circle(pen, tipX + d, tipY + 4 - Math.abs(d) * 0.4, 3.6, c.belly)).join('')
  );
}
