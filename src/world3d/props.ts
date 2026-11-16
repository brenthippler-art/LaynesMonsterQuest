import { hash2 } from '../core/rng';
import { type TileMap } from '../world/tilemap';
import { groundY } from './ground';
import { type MeshBuilder } from './meshBuilder';
import { addDoorway } from './props/doorways';
import { addIslandDecor } from './props/islandDecor';

/**
 * Everything that stands on the ground: decorations (trees, rocks...) and the
 * doorways into and out of caves. Each one is copied into the chunk's mesh at
 * its tile, a little turned and resized by a random-but-always-the-same number,
 * so a forest doesn't look like a row of identical trees.
 */
export interface Spot {
  /** Middle of the tile, in 3D (x, ground height, z). */
  x: number;
  y: number;
  z: number;
  /** Two "random" numbers 0..1 that are the same every visit for this tile. */
  r1: number;
  r2: number;
}

export function addProps(map: TileMap, x: number, y: number, props: MeshBuilder, glow: MeshBuilder): void {
  const i = y * map.width + x;
  const decor = map.decor[i];
  const door = map.doors.get(i);
  if (!decor && !door) return;
  // Spread things around inside the tile a little, so they don't line up on a grid.
  const r1 = hash2(x, y, 11);
  const r2 = hash2(x, y, 23);
  const px = x + 0.5 + (r1 - 0.5) * 0.3;
  const pz = y + 0.5 + (r2 - 0.5) * 0.3;
  const spot: Spot = { x: px, y: groundY(map, px, pz), z: pz, r1, r2 };
  if (door) addDoorway(map, x, y, props, glow);
  // Building worlds bring their own furniture: they'll get a 3D version when they're converted.
  else if (!map.look) addIslandDecor(decor, spot, props, glow);
}
