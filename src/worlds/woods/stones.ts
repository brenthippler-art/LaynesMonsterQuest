import { Decor } from '../../world/decorations';
import { Tile } from '../../world/tiles';
import { indexOf, type TileMap } from '../../world/tilemap';

/**
 * Stepping stones across the creek, and the creek itself as a "hop" square
 * (Layne can jump over it, see player.ts). A stone sits in the middle of the
 * creek on a few rows between the bridges: hop onto it, then hop off the other side.
 *
 * Returns every stone, and `perches`: the stones with water on BOTH sides (they can
 * only be reached by jumping), where a monster can perch.
 */
const STONE_ROWS = [0.46, 0.71]; // where in each stretch between bridges a stone goes, well away from the bridges
const STONE_TOP = 0.14; // just above the water (which is at -0.1)

const isWater = (t: number): boolean => t === Tile.ShallowWater || t === Tile.DeepWater;

export function addSteppingStones(map: TileMap): { stones: number[]; perches: { x: number; y: number }[] } {
  const { width: w, height: h } = map;
  const segment = Math.max(12, Math.floor(h / 7)); // the bridges repeat this often (see creekAt in generate.ts)
  const rows = STONE_ROWS.map((k) => Math.floor(segment * k));
  const stones: number[] = [];
  for (let y = 0; y < h; y++) {
    if (!rows.includes(y % segment)) continue;
    // This row's creek squares (it runs down the middle, so look there).
    const creek: number[] = [];
    for (let x = Math.floor(w * 0.3); x < Math.ceil(w * 0.7); x++) if (isWater(map.tiles[indexOf(map, x, y)])) creek.push(x);
    if (creek.length < 2) continue;
    const x = creek[Math.floor((creek.length - 1) / 2)]; // the middle one
    const i = indexOf(map, x, y);
    map.tiles[i] = Tile.Mountain; // grey rock, walkable
    map.decor[i] = Decor.None;
    stones.push(i);
  }
  const perches = stones
    .filter((i) => isWater(map.tiles[i - 1]) && isWater(map.tiles[i + 1]))
    .map((i) => ({ x: i % w, y: Math.floor(i / w) }));
  return { stones, perches };
}

/** After the hills are made (heights.ts): stones are flat blocks just above the water; the creek is hop squares. */
export function finishCreek(map: TileMap, stones: readonly number[]): void {
  const n = map.width * map.height;
  map.hops = new Uint8Array(n);
  map.flat = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (isWater(map.tiles[i])) map.hops[i] = 1;
  for (const i of stones) {
    map.flat[i] = 1;
    if (map.ground) map.ground[i] = STONE_TOP;
  }
}
