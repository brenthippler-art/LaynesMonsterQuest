import { type BufferGeometry, Color, SRGBColorSpace, Vector3 } from 'three';
import { PixelBuffer } from '../render/pixels';
import { type MapLook, type TileMap } from '../world/tilemap';
import { MeshBuilder } from './meshBuilder';

/**
 * Building-world decorations in 3D, made straight from their pixel art.
 *
 * Every pixel of the 16x16 picture becomes a little block (a "voxel"), so a
 * fridge is a chunky slab of pixel blocks with real sides: it looks like the
 * pixel art from the front and like a toy from an angle. That way all of the
 * hundreds of decorations in the building worlds get a 3D version with no
 * extra drawing, and new decorations do too.
 *
 *   furniture (solid)       stands up, 6 pixels thick
 *   small things            stand up, 3 pixels thick
 *   big flat things (rugs)  lie flat on the floor, like in the 2D game
 *
 * Standing ones are turned to face the camera (chunks.ts rebuilds them when it turns).
 * Each decoration's shape is made once per world and dropped by forgetStandees().
 */
export interface Standee {
  geometry: BufferGeometry;
  /** true = lies flat on the floor (a rug), false = stands up. */
  flat: boolean;
}

const PX = 1 / 16; // one art pixel, in tiles
/** Not furniture, and this many pixels or more: a rug or a mat, so it lies flat. */
const FLAT_PIXELS = 120;

const cache = new Map<MapLook, Map<number, Standee | null>>();

/** The 3D decoration standing on square i of a building map (null = nothing there). */
export function standeeAt(map: TileMap, i: number): Standee | null {
  const look = map.look;
  const d = map.decor[i];
  if (!look || !d) return null;
  const solid = map.solid?.[i] === 1;
  let byLook = cache.get(look);
  if (!byLook) cache.set(look, (byLook = new Map()));
  const key = d * 2 + (solid ? 1 : 0);
  if (!byLook.has(key)) byLook.set(key, makeStandee(look, d, solid));
  return byLook.get(key)!;
}

/** Leaving the world: free every decoration shape. */
export function forgetStandees(): void {
  for (const byLook of cache.values()) for (const s of byLook.values()) s?.geometry.dispose();
  cache.clear();
}

function makeStandee(look: MapLook, d: number, solid: boolean): Standee | null {
  const buf = new PixelBuffer(16, 16);
  look.drawDecor(buf, d, 0, 0, 0, 0);
  let count = 0;
  for (const v of buf.data) if (v >>> 24) count++;
  if (!count) return null;
  const flat = !solid && count >= FLAT_PIXELS;
  const geometry = voxels(buf, flat ? 1 : solid ? 6 : 3);
  return geometry ? { geometry, flat } : null;
}

const pixelColors = new Map<number, Color>();
/** A pixel (0xAABBGGRR) → a three.js color. */
function colorOf(v: number): Color {
  let c = pixelColors.get(v);
  if (!c) {
    c = new Color().setRGB((v & 255) / 255, ((v >> 8) & 255) / 255, ((v >> 16) & 255) / 255, SRGBColorSpace);
    pixelColors.set(v, c);
  }
  return c;
}

const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const e = new Vector3();

/**
 * Pixel art → blocks. The picture stands on y = 0 (its bottom row), centered
 * on x = 0, `depth` pixels thick (from -depth/2 to +depth/2 on z), front facing +z.
 * Each row's front and back are joined into runs of the same color (fewer
 * triangles); the sides are only made where a pixel has an empty neighbor.
 */
function voxels(buf: PixelBuffer, depth: number): BufferGeometry | null {
  const W = buf.width;
  const H = buf.height;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : buf.data[y * W + x]);
  const filled = (x: number, y: number) => at(x, y) >>> 24 !== 0;
  const X = (x: number) => (x - W / 2) * PX;
  const Y = (row: number) => (H - row) * PX; // row 0 = the top of the picture
  const zf = (depth / 2) * PX;
  const zb = -zf;
  const out = new MeshBuilder();

  for (let row = 0; row < H; row++) {
    const y0 = Y(row + 1);
    const y1 = Y(row);
    // Front and back: runs of same-colored pixels.
    for (let x = 0; x < W; ) {
      const v = at(x, row);
      if (!filled(x, row)) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < W && at(end, row) === v) end++;
      const color = colorOf(v);
      const x0 = X(x);
      const x1 = X(end);
      out.quad(a.set(x0, y0, zf), b.set(x1, y0, zf), c.set(x1, y1, zf), e.set(x0, y1, zf), color); // front
      out.quad(a.set(x1, y0, zb), b.set(x0, y0, zb), c.set(x0, y1, zb), e.set(x1, y1, zb), color); // back
      x = end;
    }
    // Sides: wherever a pixel has an empty neighbor, a little wall in a slightly darker color.
    for (let x = 0; x < W; x++) {
      if (!filled(x, row)) continue;
      const side = colorOf(at(x, row));
      const x0 = X(x);
      const x1 = X(x + 1);
      if (!filled(x - 1, row)) out.quad(a.set(x0, y0, zb), b.set(x0, y0, zf), c.set(x0, y1, zf), e.set(x0, y1, zb), side);
      if (!filled(x + 1, row)) out.quad(a.set(x1, y0, zf), b.set(x1, y0, zb), c.set(x1, y1, zb), e.set(x1, y1, zf), side);
      if (!filled(x, row - 1)) out.quad(a.set(x0, y1, zf), b.set(x1, y1, zf), c.set(x1, y1, zb), e.set(x0, y1, zb), side);
      if (!filled(x, row + 1)) out.quad(a.set(x0, y0, zb), b.set(x1, y0, zb), c.set(x1, y0, zf), e.set(x0, y0, zf), side);
    }
  }
  return out.build();
}
