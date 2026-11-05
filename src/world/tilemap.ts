import { Biome } from './biomes';
import { Tile, isWalkableTile } from './tiles';

/** A doorway: step on (x, y) and you appear at (toX, toY) on another map. */
export interface Door {
  x: number;
  y: number;
  toMap: string;
  toX: number;
  toY: number;
}

/** One playable map: the overworld, or a single cave. */
export interface TileMap {
  id: string;
  kind: 'overworld' | 'cave';
  width: number;
  height: number;
  /** Ground tile for each square (index = y * width + x). */
  tiles: Uint8Array;
  /** Biome for each square. */
  biome: Uint8Array;
  /** Decoration for each square (tree, rock, ...). 0 = none. */
  decor: Uint8Array;
  /** Doors, keyed by square index for quick lookup. */
  doors: Map<number, Door>;
  /** What's "outside" the edges (ocean for the overworld, rock for caves). */
  outside: Tile;
}

export function createMap(
  id: string,
  kind: TileMap['kind'],
  width: number,
  height: number,
  outside: Tile,
): TileMap {
  const n = width * height;
  return {
    id,
    kind,
    width,
    height,
    tiles: new Uint8Array(n),
    biome: new Uint8Array(n),
    decor: new Uint8Array(n),
    doors: new Map(),
    outside,
  };
}

export function indexOf(map: TileMap, x: number, y: number): number {
  return y * map.width + x;
}

export function inBounds(map: TileMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height;
}

export function tileAt(map: TileMap, x: number, y: number): Tile {
  return inBounds(map, x, y) ? (map.tiles[indexOf(map, x, y)] as Tile) : map.outside;
}

export function biomeAt(map: TileMap, x: number, y: number): Biome {
  return inBounds(map, x, y) ? (map.biome[indexOf(map, x, y)] as Biome) : Biome.Ocean;
}

export function isWalkable(map: TileMap, x: number, y: number): boolean {
  return isWalkableTile(tileAt(map, x, y));
}

export function doorAt(map: TileMap, x: number, y: number): Door | undefined {
  return inBounds(map, x, y) ? map.doors.get(indexOf(map, x, y)) : undefined;
}

export function addDoor(map: TileMap, door: Door): void {
  map.doors.set(indexOf(map, door.x, door.y), door);
}
