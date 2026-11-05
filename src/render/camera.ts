import { MAX_PIXEL_SCALE, MIN_PIXEL_SCALE, TILE_PIXELS, TILES_ACROSS_SHORT_SIDE } from '../config';
import { type TileMap } from '../world/tilemap';
import { type Viewport } from './canvas';

/**
 * The camera decides which part of the world is on screen.
 * (x, y) is the world position (in tiles) at the CENTER of the screen.
 * All screen numbers here are in DEVICE pixels.
 */
export class Camera {
  x = 0;
  y = 0;
  /** Screen pixels per art pixel. The world AND Layne use this, so their pixels match. */
  pixelPx = 4;
  /** Screen pixels per tile (always TILE_PIXELS * pixelPx). */
  tilePx = TILE_PIXELS * 4;
  viewW = 1;
  viewH = 1;
  dpr = 1;

  resize(vp: Viewport): void {
    this.viewW = vp.devW;
    this.viewH = vp.devH;
    this.dpr = vp.dpr;
    const wantedTilePx = (Math.min(vp.devW, vp.devH) / TILES_ACROSS_SHORT_SIDE);
    this.pixelPx = Math.min(MAX_PIXEL_SCALE, Math.max(MIN_PIXEL_SCALE, Math.round(wantedTilePx / TILE_PIXELS)));
    this.tilePx = TILE_PIXELS * this.pixelPx;
  }

  /** Glide toward the target. Fast enough to keep up, soft enough to feel smooth. */
  follow(tx: number, ty: number, map: TileMap, dt: number): void {
    const k = 1 - Math.exp(-dt * 10);
    this.x += (tx - this.x) * k;
    this.y += (ty - this.y) * k;
    this.clampTo(map);
  }

  /** Jump straight to the target (used at start and when changing maps). */
  snap(tx: number, ty: number, map: TileMap): void {
    this.x = tx;
    this.y = ty;
    this.clampTo(map);
  }

  /** Don't show past the edge of the map. If the map is smaller than the screen, center it. */
  private clampTo(map: TileMap): void {
    const halfW = this.viewW / this.tilePx / 2;
    const halfH = this.viewH / this.tilePx / 2;
    this.x = map.width <= halfW * 2 ? map.width / 2 : Math.min(map.width - halfW, Math.max(halfW, this.x));
    this.y = map.height <= halfH * 2 ? map.height / 2 : Math.min(map.height - halfH, Math.max(halfH, this.y));
  }

  /**
   * Screen position of world (0, 0). Snapped to whole ART pixels, so the
   * world scrolls one pixel-art pixel at a time, like a real NES. No shimmer.
   */
  get originX(): number {
    return Math.round((this.viewW / 2 - this.x * this.tilePx) / this.pixelPx) * this.pixelPx;
  }
  get originY(): number {
    return Math.round((this.viewH / 2 - this.y * this.tilePx) / this.pixelPx) * this.pixelPx;
  }

  /** World position (in tiles) → screen position, snapped to the art-pixel grid. */
  toScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: this.originX + Math.round(wx * TILE_PIXELS) * this.pixelPx,
      y: this.originY + Math.round(wy * TILE_PIXELS) * this.pixelPx,
    };
  }

  screenToWorld(devX: number, devY: number): { x: number; y: number } {
    return { x: (devX - this.originX) / this.tilePx, y: (devY - this.originY) / this.tilePx };
  }
}
