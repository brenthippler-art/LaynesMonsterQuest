import { type Point } from '../../player/player';
import { doorAt, isWalkable, type TileMap } from '../../world/tilemap';

/**
 * "Can Layne get everywhere?" checks, by flood fill: start somewhere, spread to
 * every walkable square next to a reached one, and see what's left over.
 */
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;

/** Every square of ONE map reachable from `starts` (1 = reached), and how many there are. */
export function floodMap(map: TileMap, starts: Point[]): { seen: Uint8Array; count: number } {
  const seen = new Uint8Array(map.width * map.height);
  const stack: number[] = [];
  let count = 0;
  for (const p of starts) {
    const i = p.y * map.width + p.x;
    if (isWalkable(map, p.x, p.y) && !seen[i]) {
      seen[i] = 1;
      stack.push(i);
    }
  }
  while (stack.length) {
    const i = stack.pop()!;
    count++;
    const x = i % map.width;
    const y = (i - x) / map.width;
    for (const [dx, dy] of SIDES) {
      const j = (y + dy) * map.width + x + dx;
      const inside = x + dx >= 0 && x + dx < map.width && y + dy >= 0 && y + dy < map.height;
      if (inside && isWalkable(map, x + dx, y + dy) && !seen[j]) {
        seen[j] = 1;
        stack.push(j);
      }
    }
  }
  return { seen, count };
}

/**
 * Walk the WHOLE world from the spawn, through every staircase and ladder, and
 * list any walkable square Layne could never reach (empty list = all good).
 */
export function unreachableSquares(maps: TileMap[], spawn: { map: string; x: number; y: number }): string[] {
  const byId = new Map(maps.map((m) => [m.id, m]));
  const reached = new Map<TileMap, Uint8Array>();
  const todo: { map: TileMap; p: Point }[] = [{ map: byId.get(spawn.map)!, p: spawn }];
  while (todo.length) {
    const { map, p } = todo.pop()!;
    const { seen } = floodMap(map, [p]);
    const before = reached.get(map);
    if (before) for (let i = 0; i < seen.length; i++) seen[i] |= before[i];
    reached.set(map, seen);
    // Any door reached leads on to the square it arrives at.
    for (const door of map.doors.values()) {
      const target = byId.get(door.toMap);
      if (!seen[door.y * map.width + door.x] || !target) continue;
      if (reached.get(target)?.[door.toY * target.width + door.toX]) continue;
      todo.push({ map: target, p: { x: door.toX, y: door.toY } });
    }
  }
  const problems: string[] = [];
  for (const map of maps) {
    const seen = reached.get(map);
    let missing = 0;
    let first = '';
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!isWalkable(map, x, y) || seen?.[y * map.width + x]) continue;
        if (!missing++) first = `${x},${y}`;
      }
    }
    if (missing) problems.push(`Map "${map.id}": ${missing} walkable square(s) can't be reached from the start (first one at ${first}).`);
  }
  return problems;
}

/** Is this square a door, or right next to one? (Furniture never goes there.) */
export function nearDoor(map: TileMap, x: number, y: number): boolean {
  if (doorAt(map, x, y)) return true;
  return SIDES.some(([dx, dy]) => !!doorAt(map, x + dx, y + dy));
}
