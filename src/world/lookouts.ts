import { Decor } from './decorations';
import { Tile } from './tiles';
import { doorAt, inBounds, indexOf, isWalkable, type TileMap } from './tilemap';

/**
 * Lookouts: special spots where a monster likes to perch and wait for Layne
 * (see WildMonsters). In 3D they're marked with a gold ring, so they're easy to
 * spot from far away, and getting there means climbing a hill or jumping.
 */

/** Every square Layne can WALK to from `start` (no jumping). 1 = reachable. */
export function walkableFrom(map: TileMap, start: { x: number; y: number }): Uint8Array {
  const seen = new Uint8Array(map.width * map.height);
  const sx = Math.floor(start.x);
  const sy = Math.floor(start.y);
  if (!isWalkable(map, sx, sy)) return seen;
  let wave = [indexOf(map, sx, sy)];
  seen[wave[0]] = 1;
  while (wave.length) {
    const next: number[] = [];
    for (const i of wave) {
      const x = i % map.width;
      const y = (i - x) / map.width;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (!inBounds(map, nx, ny) || !isWalkable(map, nx, ny)) continue; // (off the edge can count as walkable ground)
        const j = indexOf(map, nx, ny);
        if (seen[j]) continue;
        seen[j] = 1;
        next.push(j);
      }
    }
    wave = next;
  }
  return seen;
}

/** Lookouts stay this many squares away from the map's edge (where the edge trees would hide them). */
const MARGIN = 3;

/**
 * The top of the highest hill in each realm (grouped by `map.biome`), on a square Layne
 * can walk to. Only for maps with hills (`map.ground`). The square's decoration is cleared,
 * so the perch is easy to see.
 *
 *   reachable   from walkableFrom()
 *   lives(i)    does a realm live on square i? (no lookouts where no monsters live)
 */
export function hilltopLookouts(map: TileMap, reachable: Uint8Array, lives: (i: number) => boolean, minHeight = 0.6): { x: number; y: number }[] {
  const ground = map.ground;
  if (!ground) return [];
  const best = new Map<number, number>(); // biome → square
  for (let i = 0; i < ground.length; i++) {
    if (!reachable[i] || !lives(i) || ground[i] < minHeight) continue;
    const x = i % map.width;
    const y = (i - x) / map.width;
    if (x < MARGIN || y < MARGIN || x >= map.width - MARGIN || y >= map.height - MARGIN) continue;
    if (doorAt(map, x, y) || map.tiles[i] === Tile.CaveEntrance) continue;
    const b = map.biome[i];
    const was = best.get(b);
    if (was === undefined || ground[i] > ground[was]) best.set(b, i);
  }
  return [...best.values()].map((i) => {
    map.decor[i] = Decor.None;
    const x = i % map.width;
    return { x, y: (i - x) / map.width };
  });
}
