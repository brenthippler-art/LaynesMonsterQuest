import { type TileKind } from './types';

/**
 * 3D worlds: how tall a building-world tile stands, in tiles. Walls, fences and
 * water are worked out from the tile's NAME, so every world gets sensible heights
 * without listing them; a tile can still set its own with `height3d` in its tiles.ts.
 *
 *   river, wavePool, fountainBasin   -0.3  water, a little below the floor
 *   daySky, rideGround, track         0     painted on the floor (rides stand on these)
 *   fence, counter, stage, flowerBed  0.5   low: Layne can see over them
 *   hedge, shelf, freezer, lockers    0.9   about Layne's height
 *   slideTower                        2.2   tall
 *   wall, window, signWall...         1.3   walls
 *
 * Walking squares are floor (0), unless the tile sets its own `height3d`: then Layne
 * stands up on it (a rock in a pond he jumps onto).
 */
export const WALL_3D = 1.3;

const RULES: [RegExp, number][] = [
  [/river|pool|basin|pond/i, -0.3],
  [/sky|ground|track|arena/i, 0],
  [/fence|Rail|Bed$|Base$|stage|station|counter/, 0.5], // (Base$, not base: basementWall is a wall)
  [/hedge|shelf|locker|^freezer$/i, 0.9], // (^freezer$: freezerWall is a wall)
  [/tower/i, 2.2],
];

export function height3d(name: string, kind: TileKind | undefined): number {
  if (kind?.height3d !== undefined) return kind.height3d; // (a walkable one too: a rock you can stand on)
  if (!kind || kind.walkable) return 0;
  for (const [pattern, h] of RULES) if (pattern.test(name)) return h;
  return WALL_3D;
}
