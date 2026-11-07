import { TILE_PIXELS } from '../../config';
import { rgba, stamp, type PixelBuffer } from '../../render/pixels';
import { realmIconColor } from '../../ui/pixelIcon';

/**
 * Draw one building-world decoration into the 16x16 tile at (ox, oy):
 * centered left/right, standing on the bottom of the tile. Letters are colored
 * like the island's decorations (SPRITE_COLORS in render/decorArt.ts).
 */
export function stampDecor(buf: PixelBuffer, sprite: readonly string[], ox: number, oy: number): void {
  const w = sprite[0].length;
  const h = sprite.length;
  stamp(buf, sprite, (ch) => rgba(realmIconColor(ch)), ox + Math.floor((TILE_PIXELS - w) / 2), oy + TILE_PIXELS - h);
}
