import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { fluff, line, n, type Pen, shape } from './pen';

/**
 * Animal tops for the newer creatures. Everything has a rounded tip: friendly, never sharp.
 *   dragonhorns  two curved horns swept back
 *   unihorn      one spiral horn
 *   mane         a big fluffy lion/horse mane all around the head
 *   frill        a fan-shaped, scalloped frill behind the head
 * All of them sit BEHIND the head (the head covers their bottoms).
 */
export type CreatureTop = 'dragonhorns' | 'unihorn' | 'mane' | 'frill';

const SIDES = [-1, 1] as const;

export function drawCreatureTop(pen: Pen, b: Body, style: CreatureTop, c: Palette): string {
  switch (style) {
    case 'dragonhorns': {
      let out = '';
      for (const s of SIDES) {
        const x = CENTER_X + s * b.rx * 0.42;
        const y = b.topYAt(x) + 8;
        const X = (dx: number) => n(x + s * dx);
        out += shape(
          pen,
          `M${X(-9)} ${n(y + 2)} C${X(-7)} ${n(y - 20)} ${X(10)} ${n(y - 32)} ${X(28)} ${n(y - 30)}` +
            ` Q${X(35)} ${n(y - 29)} ${X(32)} ${n(y - 22)} C${X(20)} ${n(y - 20)} ${X(10)} ${n(y - 12)} ${X(9)} ${n(y + 2)} Z`,
          c.accent,
        );
      }
      return out;
    }
    case 'unihorn': {
      const by = b.top + 10;
      const h = 64;
      const x = CENTER_X;
      // A cone with a round tip, and three slanted lines for the spiral.
      let out = shape(pen, `M${x - 13} ${n(by)} L${x - 4} ${n(by - h + 7)} Q${x} ${n(by - h - 1)} ${x + 4} ${n(by - h + 7)} L${x + 13} ${n(by)} Z`, c.accent);
      for (const k of [0.3, 0.52, 0.72]) {
        const y = by - h * k;
        const half = 13 - 9 * k;
        out += line(pen, `M${n(x - half)} ${n(y + 3)} L${n(x + half)} ${n(y - 3)}`, 2.5);
      }
      return out;
    }
    case 'mane': {
      // A ring of puffs around the head, plus a few on top: one fluffy shape.
      const cy = b.cy - b.ry * 0.05;
      const puffs: [number, number, number][] = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        puffs.push([b.cx + Math.cos(a) * b.rx * 0.98, cy + Math.sin(a) * b.ry * 0.98, b.rx * 0.32]);
      }
      return fluff(pen, puffs, c.accent);
    }
    case 'frill': {
      // A big scalloped fan behind the head, with a lighter fan inside it.
      const fan = (r: number, bumps: number, color: string) => {
        const pts: string[] = [];
        for (let i = 0; i <= 64; i++) {
          const a = Math.PI + (i / 64) * Math.PI; // the top half, left to right
          const k = 1 + (bumps ? 0.07 * Math.abs(Math.sin(a * bumps)) : 0);
          pts.push(`${i ? 'L' : 'M'}${n(b.cx + Math.cos(a) * r * k)} ${n(b.cy + Math.sin(a) * r * k)}`);
        }
        return shape(pen, pts.join(' ') + ' Z', color);
      };
      return fan(b.rx * 1.32, 6, c.accent) + fan(b.rx * 1.08, 0, c.belly);
    }
  }
}
