import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { drawFlame } from './tops';
import { circle, ellipse, line, n, type Pen, pts, shape, tube } from './pen';

import { type CreatureFeet, drawCreatureFeet, drawClawArm } from './creatureLimbs';
import { type CreatureTail, drawCreatureTail } from './creatureTails';
import { drawBigWing } from './wings';

/** (The newer feet and claw arms are in creatureLimbs.ts, big wings in wings.ts, newer tails in creatureTails.ts.) */
export type FeetStyle = 'none' | 'stubs' | 'paws' | 'four' | 'flippers' | 'tentacles' | CreatureFeet;
/** 'wings' = bat wings, 'bird' = feathered wings, 'insect' = two rounded bug wings each side. */
export type ArmStyle = 'none' | 'nubs' | 'wings' | 'bird' | 'insect' | 'pincers' | 'leaves' | 'flippers' | 'dragonwings' | 'feathers' | 'claws';
export type TailStyle = 'none' | 'puff' | 'curl' | 'leaf' | 'flame' | 'fish' | 'zigzag' | 'long' | 'spiky' | 'fluffy' | CreatureTail;

const SIDES = [-1, 1] as const;

/** Feet are drawn BEHIND the body, so only their bottoms peek out. */
export function drawFeet(pen: Pen, b: Body, style: FeetStyle, c: Palette): string {
  const color = c.feet ?? c.main;
  const y = b.bottom;
  const xs = SIDES.map((s) => CENTER_X + s * b.rx * 0.42);
  switch (style) {
    case 'none':
      return '';
    case 'stubs':
      return xs.map((x) => ellipse(pen, x, y - 1, 13, 9, color)).join('');
    case 'paws':
      return xs
        .map((x) => ellipse(pen, x, y - 1, 13, 9, color) + line(pen, `M${n(x - 4)} ${n(y + 2)} L${n(x - 4)} ${n(y + 7)} M${n(x + 4)} ${n(y + 2)} L${n(x + 4)} ${n(y + 7)}`))
        .join('');
    case 'four':
      return (
        SIDES.map((s) => ellipse(pen, CENTER_X + s * b.rx * 0.66, y - 5, 10, 8, color)).join('') +
        SIDES.map((s) => ellipse(pen, CENTER_X + s * b.rx * 0.3, y, 11, 9, color)).join('')
      );
    case 'flippers':
      return SIDES.map((s) => ellipse(pen, CENTER_X + s * (b.rx * 0.42 + 6), y, 18, 7, color, s * 18)).join('');
    case 'tentacles':
      return [-0.45, -0.15, 0.15, 0.45]
        .map((k, i) => {
          const x = CENTER_X + k * b.rx;
          const wiggle = i % 2 ? 6 : -6;
          return tube(pen, `M${n(x)} ${n(y - 14)} C${n(x + wiggle)} ${n(y - 2)} ${n(x - wiggle)} ${n(y + 4)} ${n(x)} ${n(y + 12)}`, 9, color);
        })
        .join('');
    default:
      return drawCreatureFeet(pen, b, style, c);
  }
}

/** Arms have a back layer (wings) and a front layer (everything else). */
export function drawArms(pen: Pen, b: Body, style: ArmStyle, c: Palette): { back: string; front: string } {
  const ay = b.cy + b.ry * 0.12;
  const wing = c.wing ?? c.accent;
  let back = '';
  let front = '';
  for (const s of SIDES) {
    const x = b.sideXAt(ay, s) - s * 3;
    switch (style) {
      case 'none':
        break;
      case 'nubs':
        front += ellipse(pen, x, ay, 7.5, 13, c.main, -s * 32);
        break;
      case 'flippers':
        front += ellipse(pen, x + s * 2, ay + 6, 8, 20, c.main, -s * 28);
        break;
      case 'wings': {
        const wy = b.cy - b.ry * 0.2;
        const wx = b.sideXAt(wy, s) - s * 8;
        back += shape(pen, `M${n(wx)} ${n(wy - 8)} Q${n(wx + s * 26)} ${n(wy - 40)} ${n(wx + s * 50)} ${n(wy - 30)} Q${n(wx + s * 42)} ${n(wy - 20)} ${n(wx + s * 46)} ${n(wy - 8)} Q${n(wx + s * 34)} ${n(wy - 12)} ${n(wx + s * 32)} ${n(wy + 2)} Q${n(wx + s * 20)} ${n(wy - 2)} ${n(wx + s * 16)} ${n(wy + 12)} Q${n(wx + s * 8)} ${n(wy + 4)} ${n(wx)} ${n(wy + 10)} Z`, wing);
        break;
      }
      case 'bird': {
        // A raised wing with a scalloped, feathery back edge.
        const wy = b.cy - b.ry * 0.1;
        const wx = b.sideXAt(wy, s) - s * 10;
        const X = (dx: number) => n(wx + s * dx);
        const Y = (dy: number) => n(wy + dy);
        back += shape(
          pen,
          `M${X(0)} ${Y(-6)} C${X(10)} ${Y(-30)} ${X(38)} ${Y(-38)} ${X(50)} ${Y(-26)} C${X(46)} ${Y(-22)} ${X(48)} ${Y(-16)} ${X(42)} ${Y(-12)}` +
            ` C${X(40)} ${Y(-6)} ${X(34)} ${Y(-6)} ${X(32)} ${Y(-2)} C${X(28)} ${Y(4)} ${X(22)} ${Y(2)} ${X(18)} ${Y(8)} C${X(12)} ${Y(10)} ${X(6)} ${Y(10)} ${X(0)} ${Y(10)} Z`,
          wing,
        );
        break;
      }
      case 'insect': {
        const wy = b.cy - b.ry * 0.35;
        const wx = b.sideXAt(wy, s) - s * 4;
        back += ellipse(pen, wx + s * 14, wy - 12, 19, 11, wing, -s * 30);
        back += ellipse(pen, wx + s * 12, wy + 8, 13, 8, wing, s * 20);
        break;
      }
      case 'pincers':
        front += tube(pen, `M${n(x)} ${n(ay)} Q${n(x + s * 14)} ${n(ay + 2)} ${n(x + s * 18)} ${n(ay - 12)}`, 7, c.main);
        front += ellipse(pen, x + s * 20, ay - 20, 12, 10, c.main, -s * 20);
        front += ellipse(pen, x + s * 25, ay - 31, 8, 5, c.main, -s * 20);
        break;
      case 'leaves':
        front += shape(pen, `M${n(x)} ${n(ay)} C${n(x + s * 8)} ${n(ay - 10)} ${n(x + s * 26)} ${n(ay - 6)} ${n(x + s * 32)} ${n(ay + 6)} C${n(x + s * 20)} ${n(ay + 10)} ${n(x + s * 8)} ${n(ay + 8)} ${n(x)} ${n(ay)} Z`, c.accent);
        front += line(pen, `M${n(x + s * 2)} ${n(ay + 1)} L${n(x + s * 26)} ${n(ay + 4)}`);
        break;
      case 'dragonwings':
      case 'feathers':
        back += drawBigWing(pen, b, style, s, wing);
        break;
      case 'claws':
        front += drawClawArm(pen, x, ay, s, c);
        break;
    }
  }
  return { back, front };
}

/** Tails come out of the right side and are drawn BEHIND the body. */
export function drawTail(pen: Pen, b: Body, style: TailStyle, c: Palette): string {
  const ty = b.cy + b.ry * 0.25;
  const tx = b.sideXAt(ty, 1) - 6;
  const p = (dx: number, dy: number) => `${n(tx + dx)} ${n(ty + dy)}`;
  switch (style) {
    case 'none':
      return '';
    case 'puff':
      return circle(pen, tx + 8, ty, 13, c.belly);
    case 'curl':
      return tube(pen, `M${p(0, 0)} C${p(28, 2)} ${p(40, -26)} ${p(26, -36)} C${p(16, -42)} ${p(8, -30)} ${p(18, -24)}`, 9, c.main);
    case 'leaf':
      return shape(pen, `M${p(0, 0)} C${p(10, -24)} ${p(36, -34)} ${p(44, -30)} C${p(42, -12)} ${p(24, 4)} ${p(0, 0)} Z`, c.accent) + line(pen, `M${p(2, -2)} Q${p(22, -14)} ${p(40, -28)}`);
    case 'flame':
      return tube(pen, `M${p(0, 0)} Q${p(20, 0)} ${p(24, -12)}`, 9, c.main) + drawFlame(pen, tx + 25, ty - 8, 32, c);
    case 'fish':
      return shape(pen, `M${p(0, -6)} L${p(30, -24)} Q${p(22, 0)} ${p(30, 20)} L${p(0, 6)} Z`, c.accent);
    case 'zigzag':
      return shape(pen, pts(tx, ty, 1, [[0, -6], [18, -16], [14, -6], [34, -24], [26, 2], [30, -6], [0, 8]]), c.accent);
    case 'long':
      return tube(pen, `M${p(0, 0)} C${p(24, 8)} ${p(36, -6)} ${p(40, -24)}`, 7, c.main) + circle(pen, tx + 40, ty - 28, 8, c.accent);
    case 'spiky': {
      const cx = tx + 32;
      const cy = ty - 16;
      const star: [number, number][] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r = i % 2 ? 8 : 14;
        star.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      return tube(pen, `M${p(0, 0)} Q${p(20, 2)} ${p(28, -10)}`, 10, c.main) + shape(pen, pts(cx, cy, 1, star), c.accent);
    }
    case 'fluffy':
      return ellipse(pen, tx + 16, ty - 24, 15, 30, c.main, 28) + ellipse(pen, tx + 28, ty - 46, 8, 10, c.belly, 28);
    default:
      return drawCreatureTail(pen, tx, ty, style, c);
  }
}
