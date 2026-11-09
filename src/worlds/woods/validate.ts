import { indexOf, inBounds, isWalkable, type TileMap } from '../../world/tilemap';
import { WOODS_REALMS } from './realms';

/** Check that Layne can reach every realm and every cave entrance from the spawn. */
export function checkWoodsRoutes(overworld: TileMap, caves: readonly TileMap[], spawn: { x: number; y: number }): string[] {
  const problems: string[] = [];
  if (!isWalkable(overworld, spawn.x, spawn.y)) return ['Woods spawn is blocked.'];

  const seen = new Uint8Array(overworld.width * overworld.height);
  const queue = new Int32Array(seen.length);
  let head = 0;
  let tail = 0;
  const start = indexOf(overworld, spawn.x, spawn.y);
  queue[tail++] = start;
  seen[start] = 1;
  const realms = new Set<number>();
  while (head < tail) {
    const i = queue[head++];
    const x = i % overworld.width;
    const y = Math.floor(i / overworld.width);
    realms.add(overworld.biome[i]);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!inBounds(overworld, nx, ny) || !isWalkable(overworld, nx, ny)) continue;
      const ni = indexOf(overworld, nx, ny);
      if (seen[ni]) continue;
      seen[ni] = 1;
      queue[tail++] = ni;
    }
  }

  for (let i = 0; i < WOODS_REALMS.length; i++) {
    if (!realms.has(i)) problems.push(`Cannot reach ${WOODS_REALMS[i].label} from the Woods spawn.`);
  }
  for (const [i, door] of overworld.doors) {
    if (!seen[i]) problems.push(`Cannot reach entrance to ${door.toMap}.`);
    const destination = caves.find((m) => m.id === door.toMap);
    if (!destination) problems.push(`Missing cave map ${door.toMap}.`);
    else if (!isWalkable(destination, door.toX, door.toY)) problems.push(`Unsafe landing in ${door.toMap}.`);
  }
  for (const cave of caves) {
    if (cave.doors.size !== 1) problems.push(`${cave.id} should have one return exit.`);
    for (const door of cave.doors.values()) {
      if (door.toMap !== overworld.id || !isWalkable(overworld, door.toX, door.toY)) {
        problems.push(`${cave.id} has an unsafe return exit.`);
      }
    }
  }
  return problems;
}
