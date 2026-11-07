import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { type CreatureTop, drawCreatureTop } from './creatureTops';
import { type Face } from './face';
import { drawHat, type HatTop } from './hats';
import { circle, ellipse, fluff, line, n, type Pen, pts, shape, tube } from './pen';

/** What's on top of the head. (The newer animal tops are in creatureTops.ts, the hats in hats.ts.) */
export type TopStyle =
  | CreatureTop
  | HatTop
  | 'none'
  | 'cat' // pointy ears
  | 'bunny' // long ears
  | 'round' // round mouse/bear ears
  | 'horns'
  | 'antennae'
  | 'leaf' // a little sprout
  | 'flame'
  | 'crystals'
  | 'tuft' // a fluffy puff of hair
  | 'spikes' // a row of back spikes
  | 'fins' // fish fins on the sides of the head
  | 'mushroom'; // a mushroom-cap hat

const SIDES = [-1, 1] as const;

/** Where an ear on this side sits: a bit sunk into the head so the body hides its base. */
function earBase(b: Body, side: number, spread: number): { x: number; y: number } {
  const x = CENTER_X + side * b.rx * spread;
  return { x, y: b.topYAt(x) + 8 };
}

/** A flame shape standing on (x, baseY), h tall. Used for flame tops and tails. */
export function flamePath(x: number, baseY: number, h: number): string {
  const w = h * 0.8;
  const p = (dx: number, dy: number) => `${n(x + w * dx)} ${n(baseY - h * dy)}`;
  return (
    `M${p(-0.5, 0)} Q${p(-0.66, 0.45)} ${p(-0.24, 0.66)} Q${p(-0.24, 0.42)} ${p(-0.06, 0.42)}` +
    ` Q${p(-0.14, 0.8)} ${p(0.1, 1)} Q${p(0.1, 0.66)} ${p(0.3, 0.6)} Q${p(0.66, 0.3)} ${p(0.5, 0)} Z`
  );
}

export function drawFlame(pen: Pen, x: number, baseY: number, h: number, c: Palette): string {
  return shape(pen, flamePath(x, baseY, h), c.accent) + shape(pen, flamePath(x, baseY - 2, h * 0.55), c.belly);
}

/** Tops have a back layer (behind the body) and a front layer (sitting on the head). */
export function drawTop(pen: Pen, b: Body, f: Face, style: TopStyle, c: Palette): { back: string; front: string } {
  let back = '';
  let front = '';
  switch (style) {
    case 'none':
      break;
    case 'cat':
      for (const s of SIDES) {
        const { x, y } = earBase(b, s, 0.5);
        const tip: [number, number] = [x + s * 10, y - 38];
        back += shape(pen, `M${n(x - 14)} ${n(y + 4)} L${n(tip[0])} ${n(tip[1])} L${n(x + 14)} ${n(y + 4)} Z`, c.main);
        back += shape(pen, `M${n(x - 7)} ${n(y - 2)} L${n(x + s * 7)} ${n(y - 25)} L${n(x + 7)} ${n(y - 2)} Z`, c.accent);
      }
      break;
    case 'bunny':
      for (const s of SIDES) {
        const { x, y } = earBase(b, s, 0.36);
        back += ellipse(pen, x + s * 8, y - 30, 11, 30, c.main, s * 14);
        back += ellipse(pen, x + s * 7, y - 27, 5.5, 20, c.accent, s * 14);
      }
      break;
    case 'round':
      for (const s of SIDES) {
        const { x, y } = earBase(b, s, 0.6);
        back += circle(pen, x + s * 4, y - 8, 16, c.main);
        back += circle(pen, x + s * 4, y - 7, 9, c.accent);
      }
      break;
    case 'horns':
      for (const s of SIDES) {
        const { x, y } = earBase(b, s, 0.42);
        const X = (dx: number) => n(x + s * dx);
        back += shape(pen, `M${X(-8)} ${n(y)} C${X(-8)} ${n(y - 22)} ${X(8)} ${n(y - 34)} ${X(22)} ${n(y - 40)} C${X(8)} ${n(y - 26)} ${X(9)} ${n(y - 14)} ${X(9)} ${n(y)} Z`, c.accent);
      }
      break;
    case 'antennae':
      for (const s of SIDES) {
        const { x, y } = earBase(b, s, 0.28);
        const tipX = x + s * 16;
        const tipY = y - 40;
        back += tube(pen, `M${n(x)} ${n(y)} Q${n(x + s * 2)} ${n(y - 24)} ${n(tipX)} ${n(tipY)}`, 4.5, c.main);
        back += circle(pen, tipX, tipY, 7, c.accent);
      }
      break;
    case 'leaf': {
      const by = b.top + 6;
      const sx = CENTER_X + 2;
      const sy = by - 16;
      back += tube(pen, `M${CENTER_X} ${n(by)} Q${CENTER_X - 2} ${n(by - 10)} ${n(sx)} ${n(sy)}`, 5, c.accent);
      // big leaf to the right, small leaf to the left
      back += shape(pen, `M${n(sx)} ${n(sy)} C${n(sx + 8)} ${n(sy - 22)} ${n(sx + 34)} ${n(sy - 24)} ${n(sx + 40)} ${n(sy - 18)} C${n(sx + 30)} ${n(sy - 2)} ${n(sx + 12)} ${n(sy + 2)} ${n(sx)} ${n(sy)} Z`, c.accent);
      back += line(pen, `M${n(sx + 2)} ${n(sy - 1)} Q${n(sx + 18)} ${n(sy - 10)} ${n(sx + 34)} ${n(sy - 17)}`);
      back += shape(pen, `M${n(sx)} ${n(sy)} C${n(sx - 6)} ${n(sy - 14)} ${n(sx - 20)} ${n(sy - 16)} ${n(sx - 26)} ${n(sy - 12)} C${n(sx - 20)} ${n(sy - 2)} ${n(sx - 8)} ${n(sy + 2)} ${n(sx)} ${n(sy)} Z`, c.accent);
      break;
    }
    case 'flame':
      back += drawFlame(pen, CENTER_X, b.top + 12, 42, c);
      break;
    case 'crystals': {
      const by = b.top + 12;
      const gem = (h: number) => `M${CENTER_X - 9} ${n(by)} L${CENTER_X - 9} ${n(by - h * 0.55)} L${CENTER_X} ${n(by - h)} L${CENTER_X + 9} ${n(by - h * 0.55)} L${CENTER_X + 9} ${n(by)} Z`;
      for (const s of SIDES) {
        back += `<g transform="rotate(${s * 28} ${CENTER_X} ${n(by + 14)})">${shape(pen, gem(32), c.accent)}</g>`;
      }
      back += shape(pen, gem(42), c.accent);
      back += line(pen, `M${CENTER_X} ${n(by - 38)} L${CENTER_X} ${n(by - 6)}`);
      break;
    }
    case 'tuft':
      front += fluff(pen, [[CENTER_X - 10, b.top + 4, 11], [CENTER_X + 10, b.top + 4, 11], [CENTER_X, b.top - 6, 13]], c.accent);
      break;
    case 'spikes': {
      const spikes: [number, number][] = [[-0.55, 18], [-0.2, 24], [0.2, 24], [0.55, 18]];
      for (const [k, h] of spikes) {
        const x = CENTER_X + k * b.rx;
        const y = b.topYAt(x) + 6;
        back += shape(pen, `M${n(x - 10)} ${n(y)} L${n(x)} ${n(y - h)} L${n(x + 10)} ${n(y)} Z`, c.accent);
      }
      break;
    }
    case 'fins':
      for (const s of SIDES) {
        const y = f.eyeY - 4;
        const x = b.sideXAt(y, s) - s * 6;
        back += shape(pen, pts(x, y, s, [[0, -12], [24, -20], [16, 0], [24, 14], [0, 10]]), c.accent);
      }
      break;
    case 'mushroom': {
      const w = Math.min(b.rx * 1.2, 62);
      const by = b.top + 16;
      const h = 36;
      front += shape(pen, `M${n(CENTER_X - w)} ${n(by)} C${n(CENTER_X - w)} ${n(by - h * 1.3)} ${n(CENTER_X + w)} ${n(by - h * 1.3)} ${n(CENTER_X + w)} ${n(by)} Q${CENTER_X} ${n(by + 8)} ${n(CENTER_X - w)} ${n(by)} Z`, c.accent);
      front += circle(pen, CENTER_X - w * 0.45, by - h * 0.5, 7, '#FFFFFF');
      front += circle(pen, CENTER_X + w * 0.4, by - h * 0.62, 6, '#FFFFFF');
      front += circle(pen, CENTER_X + w * 0.02, by - h * 0.7, 5.5, '#FFFFFF');
      break;
    }
    case 'crown':
    case 'chefhat':
    case 'lid':
      return drawHat(pen, b, style, c);
    default:
      back += drawCreatureTop(pen, b, style, c);
  }
  return { back, front };
}
