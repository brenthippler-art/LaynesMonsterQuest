import { type Palette } from '../monsterTypes';
import { type Body, CENTER_X } from './bodies';
import { circle, ellipse, n, type Pen, region, shape, tube } from './pen';

/**
 * Markings on the body. They're clipped to the body shape, so they never spill outside it.
 * 'scales' = little U-shaped scales, 'checks' = a checkerboard, 'sprinkles' = candy sprinkles.
 */
export type PatternStyle = 'none' | 'spots' | 'stripes' | 'glow' | 'cracks' | 'patches' | 'scales' | 'checks' | 'sprinkles';

const SPRINKLE_COLORS = ['#F878F8', '#F8B800', '#3CBCFC', '#FCFCFC', '#58D854'];
/** Where sprinkles go (fractions of the body size) and how each one is turned. */
const SPRINKLES: [number, number, number][] = [
  [-0.7, -0.5, 30], [-0.3, -0.82, -40], [0.25, -0.8, 60], [0.68, -0.48, -20], [0.82, -0.05, 45],
  [0.62, 0.42, -60], [0.25, 0.7, 20], [-0.2, 0.75, -30], [-0.62, 0.45, 70], [-0.84, 0.02, -10],
];

/**
 * Bodies with the face ON them: keep busy patterns away from the eyes and mouth.
 * (Bodies with a separate head don't need this.)
 */
function onFace(b: Body, u: number, v: number): boolean {
  return !b.head && Math.abs(u) < 0.62 && v > -0.55 && v < 0.6;
}

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
    case 'scales': {
      // Rows of little U shapes, every other row shifted half a step. All one part, so outlines stay tidy.
      const r = Math.max(9, b.rx * 0.17);
      let d = '';
      for (let row = 0, v = -0.9; v <= 1; row++, v += 0.5) {
        for (let u = -1.1 + (row % 2) * 0.25; u <= 1.1; u += 0.5) {
          if (onFace(b, u, v)) continue;
          const [x, y] = at(u, v);
          d += `M${n(x - r)} ${n(y)} Q${n(x)} ${n(y + r * 1.6)} ${n(x + r)} ${n(y)} Z`;
        }
      }
      return shape(pen, d, c.accent);
    }
    case 'checks': {
      // Flat squares (no outline), so the checkerboard doesn't turn a coloring page into a maze.
      const q = Math.max(12, b.rx * 0.3);
      let d = '';
      for (let gy = Math.floor((b.top - b.cy) / q) - 1; gy * q < b.bottom - b.cy + q; gy++) {
        for (let gx = Math.floor((b.left - b.cx) / q) - 1; gx * q < b.right - b.cx + q; gx++) {
          if ((gx + gy) % 2 !== 0) continue;
          const x = b.cx + gx * q;
          const y = b.cy + gy * q;
          if (onFace(b, (x + q / 2 - b.cx) / b.rx, (y + q / 2 - b.cy) / b.ry)) continue;
          d += `M${n(x)} ${n(y)}h${n(q)}v${n(q)}h${n(-q)}Z`;
        }
      }
      return shape(pen, d, c.accent, { outline: false, shade: false });
    }
    case 'sprinkles': {
      // Five colors of flat sprinkles, each color one part.
      const pieces: string[][] = SPRINKLE_COLORS.map(() => []);
      SPRINKLES.forEach(([u, v, turn], i) => {
        if (onFace(b, u, v)) return;
        const [x, y] = at(u, v);
        pieces[i % pieces.length].push(`<rect x="${n(x - 6)}" y="${n(y - 2.5)}" width="12" height="5" rx="2.5" transform="rotate(${turn} ${n(x)} ${n(y)})"/>`);
      });
      return pieces.map((rects, i) => (rects.length ? `<g fill="${region(pen, SPRINKLE_COLORS[i], { outline: false, shade: false })}">${rects.join('')}</g>` : '')).join('');
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
