import { hash2, mulberry32 } from '../core/rng';
import { Biome } from './biomes';
import { decorateMap } from './decorations';
import { Tile } from './tiles';
import { addDoor, createMap, isWalkable, tileAt, type TileMap } from './tilemap';

const CAVE_COUNT = 6;
const MIN_SPACING = 28;
const CAVE_W = 32;
const CAVE_H = 24;

/**
 * Find spots at the foot of a cliff (mountain rock with a steep peak above it
 * and open ground below), turn up to CAVE_COUNT of them into cave entrances,
 * and build a little underground map for each one.
 */
export function placeCaves(world: TileMap, seed: number): TileMap[] {
  const candidates: { x: number; y: number; r: number }[] = [];
  for (let y = 2; y < world.height - 3; y++) {
    for (let x = 2; x < world.width - 2; x++) {
      if (
        world.biome[y * world.width + x] === Biome.Mountains &&
        tileAt(world, x, y) === Tile.Mountain &&
        tileAt(world, x, y - 1) === Tile.Peak &&
        isWalkable(world, x, y + 1) &&
        isWalkable(world, x, y + 2)
      ) {
        candidates.push({ x, y, r: hash2(x, y, seed + 5) });
      }
    }
  }
  candidates.sort((a, b) => a.r - b.r); // a seeded "shuffle"

  const chosen: { x: number; y: number }[] = [];
  for (const c of candidates) {
    if (chosen.length >= CAVE_COUNT) break;
    if (chosen.every((o) => Math.hypot(o.x - c.x, o.y - c.y) >= MIN_SPACING)) chosen.push(c);
  }

  return chosen.map((spot, n) => {
    const cave = generateCave(`cave-${n + 1}`, seed + 1000 * (n + 1));
    world.tiles[spot.y * world.width + spot.x] = Tile.CaveEntrance;
    // Overworld entrance → just inside the cave exit.
    addDoor(world, { x: spot.x, y: spot.y, toMap: cave.map.id, toX: cave.arrival.x, toY: cave.arrival.y });
    // Cave exit → the square in front of the entrance.
    addDoor(cave.map, { x: cave.exit.x, y: cave.exit.y, toMap: world.id, toX: spot.x, toY: spot.y + 1 });
    return cave.map;
  });
}

interface Cave {
  map: TileMap;
  exit: { x: number; y: number };
  arrival: { x: number; y: number };
}

/**
 * Cave shape via "cellular automata": start with random rock, then repeatedly
 * smooth it (a square becomes rock if most of its neighbors are rock).
 * Then keep only the part you can actually walk to from the exit.
 */
function generateCave(id: string, seed: number): Cave {
  const exit = { x: CAVE_W >> 1, y: 2 };
  const arrival = { x: exit.x, y: 3 };
  let walls: Uint8Array = new Uint8Array(CAVE_W * CAVE_H);

  for (let attempt = 0; attempt < 40; attempt++) {
    const rand = mulberry32(seed + attempt * 7919);
    walls = randomFill(rand);
    for (let step = 0; step < 4; step++) walls = smooth(walls);

    // Carve a small open room under the exit, with rock behind it.
    for (let y = 2; y <= 4; y++) for (let x = exit.x - 1; x <= exit.x + 1; x++) walls[y * CAVE_W + x] = 0;
    for (let x = exit.x - 1; x <= exit.x + 1; x++) walls[1 * CAVE_W + x] = 1;

    if (keepReachable(walls, arrival) >= 160) break; // big enough to explore
  }

  const map = createMap(id, 'cave', CAVE_W, CAVE_H, Tile.CaveWall);
  for (let i = 0; i < walls.length; i++) {
    map.tiles[i] = walls[i] ? Tile.CaveWall : Tile.CaveFloor;
    map.biome[i] = Biome.Cave;
  }
  map.tiles[exit.y * CAVE_W + exit.x] = Tile.CaveExit;
  decorateMap(map, seed);
  return { map, exit, arrival };
}

function isBorder(x: number, y: number): boolean {
  return x === 0 || y === 0 || x === CAVE_W - 1 || y === CAVE_H - 1;
}

function randomFill(rand: () => number): Uint8Array {
  const w = new Uint8Array(CAVE_W * CAVE_H);
  for (let y = 0; y < CAVE_H; y++)
    for (let x = 0; x < CAVE_W; x++) w[y * CAVE_W + x] = isBorder(x, y) || rand() < 0.44 ? 1 : 0;
  return w;
}

function smooth(src: Uint8Array): Uint8Array {
  const out = new Uint8Array(src.length);
  for (let y = 0; y < CAVE_H; y++) {
    for (let x = 0; x < CAVE_W; x++) {
      if (isBorder(x, y)) {
        out[y * CAVE_W + x] = 1;
        continue;
      }
      let rock = 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) rock += src[(y + oy) * CAVE_W + x + ox];
      out[y * CAVE_W + x] = rock >= 5 ? 1 : 0;
    }
  }
  return out;
}

/** Flood-fill from `start`; any floor not reached becomes rock. Returns how many squares were reached. */
function keepReachable(walls: Uint8Array, start: { x: number; y: number }): number {
  const seen = new Uint8Array(walls.length);
  const stack = [start.y * CAVE_W + start.x];
  seen[stack[0]] = 1;
  let count = 0;
  while (stack.length) {
    const i = stack.pop()!;
    count++;
    for (const n of [i - 1, i + 1, i - CAVE_W, i + CAVE_W]) {
      if (!seen[n] && !walls[n]) {
        seen[n] = 1;
        stack.push(n);
      }
    }
  }
  for (let i = 0; i < walls.length; i++) if (!walls[i] && !seen[i]) walls[i] = 1;
  return count;
}
