import { mulberry32 } from '../../core/rng';
import { type Point } from '../../player/player';
import { isWalkable, type TileMap } from '../../world/tilemap';
import { floodMap, nearDoor } from './reach';
import { type BuildingPlan } from './types';

/**
 * Sprinkle each realm's decorations around its rooms, from a seed (so it's the
 * same every visit). Rules:
 *   - never on a doorway, a staircase, the start square, or right next to them
 *   - 'wall' things go against a wall, 'open' things out in the room
 *   - furniture (solid) is only kept if every square Layne could reach before
 *     can still be reached afterwards, so nothing is ever walled off
 */
export function scatterDecor(
  plan: BuildingPlan,
  maps: TileMap[],
  entries: Map<TileMap, Point[]>,
  decorIds: Map<string, number>,
  tileNames: string[],
): void {
  const rand = mulberry32(plan.seed);
  plan.realms.forEach((realm, r) => {
    const zone = r + 1;
    for (const [name, wanted] of Object.entries(realm.scatter)) {
      const kind = plan.decor[name];
      const id = decorIds.get(name)!;
      let placed = 0;
      // Every square in this realm, on any map, shuffled by the seed.
      const spots: { map: TileMap; x: number; y: number }[] = [];
      for (const map of maps) {
        for (let i = 0; i < map.biome.length; i++) if (map.biome[i] === zone) spots.push({ map, x: i % map.width, y: Math.floor(i / map.width) });
      }
      for (let i = spots.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [spots[i], spots[j]] = [spots[j], spots[i]];
      }
      for (const { map, x, y } of spots) {
        if (placed >= wanted) break;
        if (kind.on && !kind.on.includes(tileNames[map.tiles[y * map.width + x]])) continue;
        if (!fits(plan, map, x, y, kind.place ?? 'any', entries.get(map) ?? [], tileNames)) continue;
        const i = y * map.width + x;
        map.decor[i] = id;
        if (kind.solid && !staysConnected(map, x, y, entries.get(map) ?? [])) {
          map.decor[i] = 0;
          continue;
        }
        placed++;
      }
    }
  });
}

function fits(plan: BuildingPlan, map: TileMap, x: number, y: number, place: 'wall' | 'open' | 'any', entries: Point[], tileNames: string[]): boolean {
  const i = y * map.width + x;
  if (map.decor[i] || !isWalkable(map, x, y) || nearDoor(map, x, y)) return false;
  if (entries.some((p) => Math.abs(p.x - x) + Math.abs(p.y - y) <= 1)) return false;
  const tileAt = (dx: number, dy: number) => plan.tiles[tileNames[map.tiles[(y + dy) * map.width + x + dx]]];
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => tileAt(dx, dy));
  if (sides.some((t) => t?.doorway)) return false; // keep doorways clear
  const touchesWall = sides.some((t) => t && !t.walkable);
  if (place === 'wall') return touchesWall;
  if (place === 'open') return !touchesWall;
  return true;
}

/** The 8 squares around (x, y), going round in a circle: N, NE, E, SE, S, SW, W, NW. */
const RING: [number, number][] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

/**
 * Put furniture on (x, y) only if that can't wall anything off. Quick test first:
 * if the open squares around it are still joined to each other going round it,
 * nothing can get cut off. Only when that's not clear, flood-fill the whole map
 * (that's slow, so it's rare). Leaves the square solid if it's fine, clear if not.
 */
function staysConnected(map: TileMap, x: number, y: number, starts: Point[]): boolean {
  const i = y * map.width + x;
  const open = RING.map(([dx, dy]) => isWalkable(map, x + dx, y + dy));
  // Count the stretches of open squares around the ring that touch a side (not just a corner).
  let stretches = 0;
  for (let k = 0; k < 8; k++) {
    if (!open[k] || open[(k + 7) % 8]) continue; // not the start of a stretch
    let touchesSide = false;
    for (let j = k; open[j % 8] && j < k + 8; j++) if (j % 2 === 0) touchesSide = true;
    if (touchesSide) stretches++;
  }
  const allOpen = open.every(Boolean);
  if (allOpen || stretches <= 1) {
    map.solid![i] = 1;
    return true;
  }
  const before = floodMap(map, starts).count;
  map.solid![i] = 1;
  // The blocked square itself is the only one allowed to go missing.
  if (floodMap(map, starts).count === before - 1) return true;
  map.solid![i] = 0;
  return false;
}
