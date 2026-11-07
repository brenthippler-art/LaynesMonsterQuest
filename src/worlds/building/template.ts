import { type Point } from '../../player/player';
import { type Tile } from '../../world/tiles';
import { addDoor, createMap, doorAt, isWalkable, type MapLook, type TileMap } from '../../world/tilemap';
import { mapIdFor } from '../mapIds';
import { type BuildingPlan } from './types';

/**
 * Turns a building world's ASCII templates into real maps:
 *   - each character → a tile (and maybe hand-placed furniture), using the legend
 *   - the zone templates → which realm each tile is in (stored in map.biome as realm number + 1)
 *   - two characters with the same `link` on two maps → a pair of doors (stairs, ladders)
 *   - the `spawn` character → where Layne starts
 */
export interface ParsedMaps {
  maps: TileMap[];
  spawn: { map: string; x: number; y: number };
  /** Where each map can be walked into from: the spawn and every door's arrival square. */
  entries: Map<TileMap, Point[]>;
}

export function parseMaps(plan: BuildingPlan, look: MapLook, tileIds: Map<string, number>, decorIds: Map<string, number>): ParsedMaps {
  const zoneOf = new Map(plan.realms.map((r, i) => [r.zone, i + 1]));
  const links = new Map<string, { map: TileMap; x: number; y: number; arrive?: Side }[]>();
  let spawn: ParsedMaps['spawn'] | null = null;

  const maps = plan.maps.map((mp) => {
    const H = mp.rows.length;
    const W = mp.rows[0].length;
    const fail = (why: string) => {
      throw new Error(`World "${plan.id}", map "${mp.name}": ${why}`);
    };
    if (mp.rows.some((r) => r.length !== W)) fail('every row must be the same length.');
    if (mp.zones.length !== H || mp.zones.some((r) => r.length !== W)) fail('the zones template must be the same size as the map.');
    const outside = tileIds.get(mp.outside) ?? fail(`unknown outside tile "${mp.outside}".`);
    const map = createMap(mapIdFor(plan.id, mp.name), 'indoor', W, H, outside as Tile);
    map.look = look;
    map.solid = new Uint8Array(W * H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const ch = mp.rows[y][x];
        const entry = plan.legend[ch] ?? fail(`"${ch}" at ${x},${y} isn't in the legend.`);
        map.tiles[i] = tileIds.get(entry.tile) ?? fail(`unknown tile "${entry.tile}".`);
        if (entry.decor) {
          map.decor[i] = decorIds.get(entry.decor) ?? fail(`unknown decoration "${entry.decor}".`);
          if (plan.decor[entry.decor].solid) map.solid[i] = 1;
        }
        if (entry.link) links.set(entry.link, [...(links.get(entry.link) ?? []), { map, x, y, arrive: entry.arrive }]);
        if (entry.spawn) spawn = { map: map.id, x, y };
        const z = mp.zones[y][x];
        if (z !== '.') map.biome[i] = zoneOf.get(z) ?? fail(`zone letter "${z}" at ${x},${y} isn't a realm.`);
      }
    }
    return map;
  });
  if (!spawn) throw new Error(`World "${plan.id}": no spawn square in the legend/templates.`);

  // Join each pair of linked squares with doors: arrive on a free square next to the other end.
  const entries = new Map<TileMap, Point[]>(maps.map((m) => [m, []]));
  const s = spawn as ParsedMaps['spawn'];
  entries.get(maps.find((m) => m.id === s.map)!)!.push({ x: s.x, y: s.y });
  for (const [name, ends] of links) {
    if (ends.length !== 2) throw new Error(`World "${plan.id}": link "${name}" must appear exactly twice (found ${ends.length}).`);
    const [a, b] = ends;
    const arriveA = arrival(a.map, a.x, a.y, a.arrive);
    const arriveB = arrival(b.map, b.x, b.y, b.arrive);
    addDoor(a.map, { x: a.x, y: a.y, toMap: b.map.id, toX: arriveB.x, toY: arriveB.y });
    addDoor(b.map, { x: b.x, y: b.y, toMap: a.map.id, toX: arriveA.x, toY: arriveA.y });
    entries.get(a.map)!.push(arriveA);
    entries.get(b.map)!.push(arriveB);
  }
  return { maps, spawn: s, entries };
}

type Side = 'up' | 'down' | 'left' | 'right';
const STEP: Record<Side, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };

/** The square you arrive on next to a door: the side the legend asks for, else the first free side (below, above, left, right). */
function arrival(map: TileMap, x: number, y: number, prefer?: Side): Point {
  const order = (prefer ? [prefer] : ['down', 'up', 'left', 'right']) as Side[];
  for (const [dx, dy] of order.map((s) => STEP[s])) {
    const ax = x + dx;
    const ay = y + dy;
    if (isWalkable(map, ax, ay) && !doorAt(map, ax, ay)) return { x: ax, y: ay };
  }
  throw new Error(`Map "${map.id}": the stairs at ${x},${y} have no free square next to them.`);
}
