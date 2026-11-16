import { NES } from '../../render/nesPalette';
import { type TileMap } from '../../world/tilemap';
import { groundY } from '../ground';
import { type MeshBuilder, place, rgb } from '../meshBuilder';
import { SHAPES } from '../shapes';

/**
 * A lookout (a hilltop or a stepping stone where a monster likes to perch, see
 * world/lookouts.ts): a gold ring on the ground and a gold gem floating high above
 * it, so Layne can spot it from far away and head for it. Both glow, so they show
 * even in the shade of the trees.
 */
const GOLD = rgb(NES.gold);
const GEM = rgb(NES.yellowLight);

/** Which squares are lookouts, worked out once per map. */
const spots = new WeakMap<TileMap, Set<number>>();
export function isLookout(map: TileMap, i: number): boolean {
  if (!map.lookouts) return false;
  let set = spots.get(map);
  if (!set) spots.set(map, (set = new Set(map.lookouts.map((p) => p.y * map.width + p.x))));
  return set.has(i);
}

export function addLookout(map: TileMap, x: number, y: number, glow: MeshBuilder): void {
  const cx = x + 0.5;
  const cz = y + 0.5;
  const h = groundY(map, cx, cz);
  glow.add(SHAPES.ring(0.14), place(cx, h + 0.04, cz, 0.42, 0.42, 0.42, -Math.PI / 2), GOLD);
  glow.add(SHAPES.diamond(), place(cx, h + 2.8, cz, 0.24, 0.4, 0.24), GEM); // high enough to show over the trees
}
