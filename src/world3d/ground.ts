import { Tile, TILE_INFO } from '../world/tiles';
import { inBounds, isWalkable, type TileMap } from '../world/tilemap';

/**
 * How high the ground is, anywhere on a map. Positions are in tiles, like the
 * rest of the game: x across, y down the map. In 3D, the map's y becomes depth
 * (three.js calls it z) and "up" is height.
 *
 * Two kinds of map:
 *   - with `map.ground` (the island overworld): smooth hills. Each tile's corners
 *     are the average of the tiles around them, so slopes join up with no gaps.
 *   - without it (caves, and later the building worlds): flat floors, and walls
 *     that are tall blocks, like a toy model.
 */

/** Height of a tile on maps without `ground` (and of the sea past the island's edge). */
export function blockHeight(map: TileMap, t: number): number {
  if (map.look) return map.look.walkable(t) ? 0 : WALL;
  switch (t) {
    case Tile.CaveWall: return WALL + 0.2;
    case Tile.Peak: return 3;
    case Tile.DeepWater: return -1.4;
    case Tile.ShallowWater: return -0.45;
    case Tile.Lava: return -0.3;
    default: return 0;
  }
}
/** Walls are this many tiles tall: taller than Layne, low enough that the camera sees over them. */
export const WALL = 1.6;
/** The water's surface. Dry land is always a bit higher (see world/heights.ts). */
export const WATER_LEVEL = -0.1;

/** Tiles that shine by themselves (lava): drawn in the glowing mesh, bright even in the dark. */
export function tileGlows(map: TileMap, t: number): boolean {
  return !map.look && t === Tile.Lava;
}

/** The ground color of a tile (#rrggbb). */
export function tileColor(map: TileMap, t: number): string {
  return map.look ? map.look.color(t) : (TILE_INFO[t as Tile]?.color ?? '#000000');
}

/** Height of one tile (smooth maps: its stored height; others: its block height). Off the map: the "outside" tile. */
export function tileTop(map: TileMap, x: number, y: number): number {
  if (!inBounds(map, x, y)) return blockHeight(map, map.outside);
  const i = y * map.width + x;
  return map.ground ? map.ground[i] : blockHeight(map, map.tiles[i]);
}

/** Corner heights of a smooth map ((width + 1) x (height + 1) of them), worked out once per map. */
const cornerCache = new WeakMap<TileMap, Float32Array>();
export function corners(map: TileMap): Float32Array {
  let c = cornerCache.get(map);
  if (c) return c;
  const W = map.width + 1;
  c = new Float32Array(W * (map.height + 1));
  for (let y = 0; y <= map.height; y++) {
    for (let x = 0; x <= map.width; x++) {
      // A corner touches 4 tiles: up-left, up-right, down-left, down-right.
      c[y * W + x] = (tileTop(map, x - 1, y - 1) + tileTop(map, x, y - 1) + tileTop(map, x - 1, y) + tileTop(map, x, y)) / 4;
    }
  }
  cornerCache.set(map, c);
  return c;
}

/** Height of one corner (x, y = whole numbers, 0..width / 0..height). */
export function cornerAt(map: TileMap, x: number, y: number): number {
  const cx = Math.min(map.width, Math.max(0, x));
  const cy = Math.min(map.height, Math.max(0, y));
  return corners(map)[cy * (map.width + 1) + cx];
}

/**
 * The ground height under any spot. On smooth maps it follows the exact same
 * two triangles that are drawn for each tile, so feet never float or sink.
 */
export function groundY(map: TileMap, x: number, y: number): number {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (!map.ground) {
    // Flat floors. (Standing ON a wall only happens to monsters popping in at the edge: put them on the floor.)
    return isWalkable(map, tx, ty) ? tileTop(map, tx, ty) : 0;
  }
  const fx = x - tx;
  const fy = y - ty;
  const a = cornerAt(map, tx, ty);
  const b = cornerAt(map, tx + 1, ty);
  const c = cornerAt(map, tx, ty + 1);
  const d = cornerAt(map, tx + 1, ty + 1);
  // Each square is split into two triangles along its a-d diagonal (top-left to bottom-right).
  return fx >= fy ? a + (b - a) * fx + (d - b) * fy : a + (c - a) * fy + (d - c) * fx;
}
