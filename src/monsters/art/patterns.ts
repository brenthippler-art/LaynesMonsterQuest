import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { circle, ellipse, n, type Pen, shape, tube } from './pen';

/** Markings on the body. They're clipped to the body shape, so they never spill outside it. */
export type PatternStyle = 'none' | 'spots' | 'stripes' | 'glow' | 'cracks' | 'patches';

/** Spot positions as fractions of the body size, kept away from the middle of the face. */
const SPOTS: [number, number][] = [
  [-0.62, -0.38],
  [0.62, -0.45],
  [-0.66, 0.36],
  [0.66, 0.3],
  [0, -0.78],
];

export function drawPattern(pen: Pen, b: Body, style: PatternStyle, c: Palette): string {
  const at = (u: number, v: number) => [b.cx + u * b.rx, b.cy + v * b.ry] as const;
  switch (style) {
    case 'none':
      return '';
    case 'spots':
      return SPOTS.map(([u, v]) => circle(pen, ...at(u, v), b.rx * 0.13, c.accent)).join('');
    case 'glow':
      // Glowing spots: an outlined spot with a bright white center.
      return SPOTS.map(([u, v]) => {
        const [x, y] = at(u, v);
        return circle(pen, x, y, b.rx * 0.15, c.accent, { shade: false }) + circle(pen, x, y, b.rx * 0.07, '#FCFCFC', { outline: false, shade: false });
      }).join('');
    case 'stripes': {
      let out = '';
      for (const k of [-0.42, 0, 0.42]) {
        const x = CENTER_X + k * b.rx;
        out += shape(pen, `M${n(x - 8)} ${n(b.top - 4)} L${n(x + 8)} ${n(b.top - 4)} L${n(x + 1)} ${n(b.top + b.ry * 0.42)} Z`, c.accent);
      }
      for (const s of [-1, 1]) {
        for (const v of [0.1, 0.42]) {
          const y = b.cy + v * b.ry;
          const x0 = s > 0 ? b.right + 4 : b.left - 4;
          out += shape(pen, `M${n(x0)} ${n(y - 7)} L${n(x0)} ${n(y + 7)} L${n(x0 - s * b.rx * 0.38)} ${n(y)} Z`, c.accent);
        }
      }
      return out;
    }
    case 'cracks': {
      const crack = (points: [number, number][]) =>
        tube(pen, points.map(([u, v], i) => `${i ? 'L' : 'M'}${n(b.cx + u * b.rx)} ${n(b.cy + v * b.ry)}`).join(' '), 4, c.accent);
      return (
        crack([[-1, -0.2], [-0.66, -0.05], [-0.74, 0.15], [-0.5, 0.36]]) +
        crack([[1, 0.05], [0.7, 0.2], [0.78, 0.4], [0.55, 0.6]]) +
        crack([[-0.1, -1.1], [0.06, -0.72], [-0.06, -0.55]])
      );
    }
    case 'patches':
      return (
        ellipse(pen, ...at(-0.6, -0.35), b.rx * 0.34, b.ry * 0.26, c.accent, -20) +
        ellipse(pen, ...at(0.66, 0.3), b.rx * 0.3, b.ry * 0.24, c.accent, 15) +
        ellipse(pen, ...at(0.35, -0.75), b.rx * 0.16, b.ry * 0.12, c.accent, 0)
      );
  }
}

export function drawBelly(pen: Pen, b: Body, c: Palette): string {
  return ellipse(pen, CENTER_X, b.cy + b.ry * 0.42, b.rx * 0.6, b.ry * 0.55, c.belly, 0);
}
