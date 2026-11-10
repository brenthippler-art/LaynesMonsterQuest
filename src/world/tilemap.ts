import { type PixelBuffer } from '../render/pixels';
import { Tile, isWalkableTile } from './tiles';

/** A doorway: step on (x, y) and you appear at (toX, toY) on another map. */
export interface Door {
  x: number;
  y: number;
  toMap: string;
  toX: number;
  toY: number;
}

/**
 * How a map that brings its OWN tiles and decorations (a building world) draws and
 * walks. Island maps don't have one: they use the island tiles in tiles.ts.
 */
export interface MapLook {
  /** Can Layne walk on this kind of tile? */
  walkable(t: number): boolean;
  /** The tile's main color (off the edge of the map, and on the corner map). */
  color(t: number): string;
  drawTile(buf: PixelBuffer, map: TileMap, x: number, y: number, ox: number, oy: number): void;
  drawDecor(buf: PixelBuffer, d: number, x: number, y: number, ox: number, oy: number): void;
}

/** A little picture on the corner map (a room's realm icon). */
export interface MapLabel {
  x: number;
  y: number;
  icon: readonly string[];
}

/**
 * Something on a building map that moves, like a theme-park ride. It's drawn fresh
 * every frame on top of the ground (the ground itself is painted once and kept), and
 * under Layne and the monsters. It always stands on squares nobody can walk on.
 */
export interface MapRide {
  /** The squares it covers: top-left corner and size, in tiles. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Draw it with its top-left corner at screen spot (sx, sy). p = screen pixels per art pixel. */
  draw(ctx: CanvasRenderingContext2D, sx: number, sy: number, p: number, time: number): void;
}

/** One playable map: the overworld, a single cave, or the inside of a building. */
export interface TileMap {
  id: string;
  kind: 'overworld' | 'cave' | 'indoor';
  width: number;
  height: number;
  /** Ground tile for each square (index = y * width + x). */
  tiles: Uint8Array;
  /** Area code for each square. Each world decides what the numbers mean (the island uses its Biome list). */
  biome: Uint8Array;
  /** Decoration for each square (tree, rock, ...). 0 = none. */
  decor: Uint8Array;
  /** Doors, keyed by square index for quick lookup. */
  doors: Map<number, Door>;
  /** What's "outside" the edges (ocean for the overworld, rock for caves). */
  outside: Tile;
  /** Building worlds: their own tiles and decorations (see worlds/building/). */
  look?: MapLook;
  /** Building worlds: 1 = furniture stands here and blocks walking. */
  solid?: Uint8Array;
  /** Building worlds: realm icons for the corner map, one per room. */
  labels?: MapLabel[];
  /** Building worlds: rides and other moving things (see worlds/building/rides.ts). */
  rides?: MapRide[];
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

export function isWalkable(map: TileMap, x: number, y: number): boolean {
  const t = tileAt(map, x, y);
  if (!(map.look ? map.look.walkable(t) : isWalkableTile(t))) return false;
  // Furniture (building worlds only) blocks the square it stands on.
  return !(map.solid && inBounds(map, x, y) && map.solid[indexOf(map, x, y)]);
}

export function doorAt(map: TileMap, x: number, y: number): Door | undefined {
  return inBounds(map, x, y) ? map.doors.get(indexOf(map, x, y)) : undefined;
}

export function addDoor(map: TileMap, door: Door): void {
  map.doors.set(indexOf(map, door.x, door.y), door);
}
