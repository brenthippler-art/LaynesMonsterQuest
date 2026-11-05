import { EMPTY, INK, type PixelMonster } from './rasterize';

/**
 * Step 3: turn the grid of "which part is this pixel?" into finished pixel art.
 *
 *   color   → 16-bit style: black outline around the monster, a darker line
 *             where one part overlaps another ("selective outline"), and
 *             light from the top-left (highlight edge + shadow edge).
 *   outline → coloring page: white everywhere, black lines only.
 */
export type SpriteMode = 'color' | 'outline';

const BLACK = '#000000';
const WHITE = '#FFFFFF';

/** Mix a "#RRGGBB" color toward white (amount > 0) or black (amount < 0). */
function tint(hex: string, amount: number): string {
  const v = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const k = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * k);
  const r = mix((v >> 16) & 255);
  const g = mix((v >> 8) & 255);
  const b = mix(v & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** One color per pixel (null = see-through), row by row. */
export function paintPixels(p: PixelMonster, mode: SpriteMode): (string | null)[] {
  const { width: W, height: H, cells, regions } = p;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? EMPTY : cells[y * W + x]);
  const out: (string | null)[] = new Array(W * H).fill(null);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = cells[y * W + x];
      const neighbors = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];

      if (c === EMPTY) {
        // Outside the monster but touching it: the black outline.
        if (neighbors.some((q) => q !== EMPTY)) out[y * W + x] = BLACK;
        continue;
      }
      if (c === INK) {
        out[y * W + x] = BLACK;
        continue;
      }

      const r = regions[c];
      // This pixel is on the edge of a part that's BEHIND another part → it becomes the line between them.
      const behindSomething = neighbors.some((q) => q >= 0 && q !== c && regions[q].outline && regions[q].depth > r.depth);

      if (mode === 'outline') {
        out[y * W + x] = behindSomething ? BLACK : WHITE;
      } else if (behindSomething) {
        out[y * W + x] = tint(r.color, -0.55);
      } else if (r.shade && at(x - 1, y - 1) !== c) {
        out[y * W + x] = tint(r.color, 0.35); // lit edge (light comes from the top-left)
      } else if (r.shade && (at(x + 1, y + 1) !== c || at(x + 2, y + 1) !== c)) {
        out[y * W + x] = tint(r.color, -0.25); // shadow edge
      } else {
        out[y * W + x] = r.color;
      }
    }
  }
  return out;
}

/** Pixels → an SVG made of crisp squares (scales to any size, prints sharply). */
export function pixelsToSvg(pixels: (string | null)[], width: number, height: number, label: string): string {
  const runsByColor = new Map<string, string[]>();
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const color = pixels[y * width + x];
      if (!color) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < width && pixels[y * width + x + run] === color) run++;
      if (!runsByColor.has(color)) runsByColor.set(color, []);
      runsByColor.get(color)!.push(`M${x} ${y}h${run}v1h-${run}z`);
      x += run;
    }
  }
  const paths = [...runsByColor].map(([color, runs]) => `<path fill="${color}" d="${runs.join('')}"/>`).join('');
  // Placed straight into the page, so no xmlns is needed.
  return `<svg viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges" role="img" aria-label="${label}">${paths}</svg>`;
}
