import { type Palette } from '../monsterTypes';
import { flamePath } from './tops';
import { n, type Pen, region, shape, tube } from './pen';

/**
 * Newer tails (they come out of the right side and sit behind the body, like the older ones):
 *   dragon   a thick tail that curves up and ends in a soft, round spade
 *   serpent  a long wavy tail that curls back at the end
 *   plume    a long phoenix tail: three flame-shaped feathers fanned out
 */
export type CreatureTail = 'dragon' | 'serpent' | 'plume';

export function drawCreatureTail(pen: Pen, tx: number, ty: number, style: CreatureTail, c: Palette): string {
  const p = (dx: number, dy: number) => `${n(tx + dx)} ${n(ty + dy)}`;
  switch (style) {
    case 'dragon': {
      // One part drawn as two strokes: thick near the body, thinner toward the tip.
      const id = region(pen, c.main);
      const stroke = (d: string, w: number) => `<path d="${d}" fill="none" stroke="${id}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      const tail = stroke(`M${p(0, 0)} C${p(18, 16)} ${p(32, 18)} ${p(42, 10)}`, 16) + stroke(`M${p(40, 12)} C${p(48, 6)} ${p(50, 0)} ${p(48, -6)}`, 10);
      const sx = tx + 48;
      const sy = ty - 8;
      const S = (dx: number, dy: number) => `${n(sx + dx)} ${n(sy + dy)}`;
      const spade = `M${S(0, 8)} C${S(-15, 0)} ${S(-11, -15)} ${S(0, -18)} C${S(11, -15)} ${S(15, 0)} ${S(0, 8)} Z`;
      return tail + shape(pen, spade, c.accent);
    }
    case 'serpent':
      return tube(pen, `M${p(0, 0)} C${p(20, 10)} ${p(30, -10)} ${p(48, -2)} C${p(64, 6)} ${p(70, -14)} ${p(58, -22)} C${p(50, -26)} ${p(46, -16)} ${p(54, -14)}`, 10, c.main);
    case 'plume': {
      // Three feathers fanned out behind, pointing right and down; outer color + a lighter middle.
      const base = { x: tx + 4, y: ty };
      return [
        { turn: 80, h: 54 },
        { turn: 108, h: 62 },
        { turn: 136, h: 50 },
      ]
        .map(({ turn, h }, i) => {
          const g = (inner: string) => `<g transform="rotate(${turn} ${n(base.x)} ${n(base.y)})">${inner}</g>`;
          const outer = i === 1 ? c.accent : c.main;
          return g(shape(pen, flamePath(base.x, base.y, h), outer) + shape(pen, flamePath(base.x, base.y - 3, h * 0.55), c.belly));
        })
        .join('');
    }
  }
}
