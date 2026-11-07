import { TILE_PIXELS } from '../../config';
import { PixelBuffer } from '../../render/pixels';
import { type Tile } from '../../world/tiles';
import { createMap, type MapLook } from '../../world/tilemap';
import { stampDecor } from './decorPaint';

/**
 * The picture behind the encounter screen for one realm: a little "stage" of
 * that room, built from the world's own tiles and furniture:
 *
 *   ┌────────────────┐
 *   │ wall wall wall │   1 row of the realm's wall tile
 *   │ floor  🛋  📺  │   2 rows of its floor, with a few decorations standing on it
 *   │ floor floor    │
 *   └────────────────┘
 *
 * It's tiny (4x3 tiles = 64x48 pixels) and gets stretched over the screen with crisp pixels.
 */
const COLS = 4;
const ROWS = 3;

export function paintRoomScene(look: MapLook, wallId: number, floorId: number, sprites: (readonly string[])[]): HTMLCanvasElement {
  // A pretend 4x3 map, so the tiles can peek at their neighbors just like on a real map.
  const map = createMap('scene', 'indoor', COLS, ROWS, wallId as Tile);
  for (let i = 0; i < COLS * ROWS; i++) map.tiles[i] = i < COLS ? wallId : floorId;
  const T = TILE_PIXELS;
  const buf = new PixelBuffer(COLS * T, ROWS * T);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) look.drawTile(buf, map, x, y, x * T, y * T);
  // Decorations stand along the middle row, spread out evenly.
  sprites.slice(0, COLS).forEach((sprite, i) => {
    const slot = Math.round(((i + 0.5) * COLS) / Math.min(sprites.length, COLS) - 0.5);
    stampDecor(buf, sprite, slot * T, T);
  });
  return buf.toCanvas();
}
