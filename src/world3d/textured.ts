import { CanvasTexture, NearestFilter, SRGBColorSpace, Vector3 } from 'three';
import { TILE_PIXELS } from '../config';
import { PixelBuffer } from '../render/pixels';
import { inBounds, type TileMap } from '../world/tilemap';
import { blockHeight, tileTop } from './ground';
import { type MeshBuilder, rgb, shade, type UV } from './meshBuilder';

/**
 * Building-world floors and walls wear the SAME 16x16 pixel-art pictures as the
 * 2D game, stretched over the 3D blocks with crisp pixels (no smoothing): the
 * Nintendo 64 look of low-resolution pictures on simple shapes.
 *
 * Each chunk gets one picture of all its tiles (16 x 16 tiles = 256 x 256 pixels),
 * painted by the world's own tile painters, and every tile's top and sides point
 * at their tile's square of that picture.
 */
const CHUNK = 16; // (same as chunks.ts; repeated here so the two files don't import each other)

/** Paint the picture of a chunk's tiles. */
export function chunkPicture(map: TileMap, kx: number, ky: number): CanvasTexture {
  const look = map.look!;
  const buf = new PixelBuffer(CHUNK * TILE_PIXELS, CHUNK * TILE_PIXELS);
  for (let ty = 0; ty < CHUNK; ty++) {
    for (let tx = 0; tx < CHUNK; tx++) {
      const x = kx * CHUNK + tx;
      const y = ky * CHUNK + ty;
      if (inBounds(map, x, y)) look.drawTile(buf, map, x, y, tx * TILE_PIXELS, ty * TILE_PIXELS);
    }
  }
  return crispTexture(buf);
}

/** A picture for the GPU, with chunky pixels: no smoothing, no blurry far-away copies. */
export function crispTexture(buf: PixelBuffer): CanvasTexture {
  const tex = new CanvasTexture(buf.toCanvas());
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = SRGBColorSpace; // the colors are ordinary screen colors, like the rest of the game
  return tex;
}

const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const d = new Vector3();
const TOP = rgb('#ffffff');
const SIDE = shade(TOP, -0.3); // walls' sides a bit darker, so blocks read as blocks

/** One building tile: a flat top with its picture, and sides down to any lower neighbor (with the same picture). */
export function texturedTile(map: TileMap, x: number, y: number, kx: number, ky: number, out: MeshBuilder): void {
  const h = tileTop(map, x, y);
  // Where this tile's square is in the chunk's picture (v = 1 is the picture's top row).
  const u0 = (x - kx * CHUNK) / CHUNK;
  const u1 = u0 + 1 / CHUNK;
  const vTop = 1 - (y - ky * CHUNK) / CHUNK;
  const vBottom = vTop - 1 / CHUNK;
  const nw: UV = [u0, vTop];
  const ne: UV = [u1, vTop];
  const sw: UV = [u0, vBottom];
  const se: UV = [u1, vBottom];

  // The top: north edge = the picture's top edge, like the 2D map.
  a.set(x, h, y); // north-west corner
  b.set(x + 1, h, y); // north-east
  c.set(x, h, y + 1); // south-west
  d.set(x + 1, h, y + 1); // south-east
  out.quadUV(a, c, d, b, TOP, nw, sw, se, ne);

  // Sides: the picture stood up (its top edge along the block's top edge).
  const sides: [number, number, number, number, number, number][] = [
    [0, -1, x + 1, y, x, y], // north
    [0, 1, x, y + 1, x + 1, y + 1], // south
    [-1, 0, x, y, x, y + 1], // west
    [1, 0, x + 1, y + 1, x + 1, y], // east
  ];
  for (const [dx, dy, ex, ey, fx, fy] of sides) {
    const nh = inBounds(map, x + dx, y + dy) ? tileTop(map, x + dx, y + dy) : blockHeight(map, map.outside);
    if (nh >= h) continue;
    a.set(ex, h, ey);
    b.set(fx, h, fy);
    c.set(fx, nh, fy);
    d.set(ex, nh, ey);
    out.quadUV(a, d, c, b, SIDE, nw, sw, se, ne);
  }
}
