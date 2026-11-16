import { hash2 } from '../../core/rng';
import { Tile } from '../../world/tiles';
import { type TileMap } from '../../world/tilemap';

/**
 * Gentle rolling hills for The Woods in 3D, in tiles (1 = as tall as one square is wide).
 *
 * The Woods is all walkable forest floor, so the hills are only for looks: walking,
 * monsters and saves still work on the flat tile map, exactly like the island.
 * The creek sits in a little valley: the ground slopes down to its banks.
 */
const HILL = 1.8; // the tallest hills
const LOWEST_LAND = 0.08; // dry ground always sits a little above the water
const BANK = 0.28; // how much the ground rises per square away from the creek
const CREEK = -0.45; // the creek bed (the water's surface is at -0.1)

/** Smooth "value noise": random heights on a grid every `size` squares, blended in between (0..1). */
function smooth(x: number, y: number, size: number, salt: number): number {
  const gx = x / size;
  const gy = y / size;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  // Smoothstep makes the blend ease in and out, so there are no sharp creases.
  const fx = (gx - x0) * (gx - x0) * (3 - 2 * (gx - x0));
  const fy = (gy - y0) * (gy - y0) * (3 - 2 * (gy - y0));
  const top = hash2(x0, y0, salt) * (1 - fx) + hash2(x0 + 1, y0, salt) * fx;
  const bottom = hash2(x0, y0 + 1, salt) * (1 - fx) + hash2(x0 + 1, y0 + 1, salt) * fx;
  return top * (1 - fy) + bottom * fy;
}

const isWater = (t: number): boolean => t === Tile.ShallowWater || t === Tile.DeepWater;

export function woodsHeights(map: TileMap, seed: number): Float32Array {
  const { width: w, height: h, tiles } = map;
  const n = w * h;

  // How many squares each square is from the nearest water (a flood outwards from the creek).
  const reach = Math.ceil(HILL / BANK) + 1;
  const dist = new Uint8Array(n).fill(255);
  let wave: number[] = [];
  for (let i = 0; i < n; i++) {
    if (isWater(tiles[i])) {
      dist[i] = 0;
      wave.push(i);
    }
  }
  for (let step = 1; step <= reach && wave.length; step++) {
    const next: number[] = [];
    for (const i of wave) {
      const x = i % w;
      const y = (i - x) / w;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (dist[j] !== 255) continue;
        dist[j] = step;
        next.push(j);
      }
    }
    wave = next;
  }

  const heights = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (isWater(tiles[i])) {
        heights[i] = CREEK;
        continue;
      }
      // Big slow hills, plus smaller bumps on top.
      const hills = smooth(x, y, 26, seed + 1) * 0.7 + smooth(x, y, 9, seed + 2) * 0.3;
      let top = LOWEST_LAND + hills * HILL;
      // Near the creek, slope down to its banks.
      top = Math.min(top, LOWEST_LAND + (dist[i] - 1) * BANK);
      heights[i] = top;
    }
  }
  return heights;
}
