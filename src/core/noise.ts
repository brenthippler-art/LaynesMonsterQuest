import { mulberry32 } from './rng';

/**
 * 2D simplex noise: smooth random "hills and valleys". Nearby inputs give
 * nearby outputs, which is why biomes made from it have natural, blobby edges.
 * Output is roughly in [-1, 1].
 */
export type Noise2D = (x: number, y: number) => number;

const GRADIENTS = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export function createNoise2D(seed: number): Noise2D {
  // Shuffle 0..255 with our seeded random, then repeat it so we never index past the end.
  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function corner(ix: number, iy: number, x: number, y: number): number {
    const t = 0.5 - x * x - y * y;
    if (t < 0) return 0;
    const g = GRADIENTS[perm[ix + perm[iy]] & 7];
    const t2 = t * t;
    return t2 * t2 * (g[0] * x + g[1] * y);
  }

  return (x, y) => {
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const n =
      corner(ii, jj, x0, y0) +
      corner(ii + i1, jj + j1, x1, y1) +
      corner(ii + 1, jj + 1, x2, y2);
    return 70 * n;
  };
}

/**
 * "Fractal" noise: several layers of noise, each smaller and quieter than the
 * last. Big shapes + small wiggles = coastlines that look natural. Output ~[-1, 1].
 */
export function fbm(noise: Noise2D, x: number, y: number, octaves = 4): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}
