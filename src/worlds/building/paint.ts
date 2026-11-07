import { TILE_PIXELS } from '../../config';
import { hash2 } from '../../core/rng';
import { rgba } from '../../render/pixels';
import { type TileCtx } from './types';

/**
 * Little painting helpers for building-world tiles (floors, walls, grass...).
 * Every tile is 16x16 pixels; patterns use the tile's map spot so they line up
 * from tile to tile and look the same on every visit.
 */
const T = TILE_PIXELS;

export function fill(c: TileCtx, hex: string): void {
  c.buf.fill(c.ox, c.oy, T, T, rgba(hex));
}

/** A filled rectangle inside the tile (x, y, w, h in tile pixels). */
export function rect(c: TileCtx, x: number, y: number, w: number, h: number, hex: string): void {
  c.buf.fill(c.ox + x, c.oy + y, w, h, rgba(hex));
}

/** A few single pixels at spots that look random but never change. */
export function speckle(c: TileCtx, hex: string, count: number, salt: number): void {
  const color = rgba(hex);
  for (let k = 0; k < count; k++) {
    c.buf.set(c.ox + Math.floor(hash2(c.x * 31 + k, c.y, salt) * T), c.oy + Math.floor(hash2(c.x, c.y * 17 + k, salt + 1) * T), color);
  }
}

/** A checkerboard of `size`-pixel squares (kitchen floors). */
export function checker(c: TileCtx, a: string, b: string, size: number): void {
  const ca = rgba(a);
  const cb = rgba(b);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) c.buf.set(c.ox + x, c.oy + y, (Math.floor(x / size) + Math.floor(y / size)) % 2 ? cb : ca);
}

/** Wooden planks: long boards with dark seams, each row's joint in a different place. */
export function planks(c: TileCtx, wood: string, seam: string, grain: string): void {
  fill(c, wood);
  const s = rgba(seam);
  for (let row = 0; row < 4; row++) {
    const y = row * 4 + 3;
    for (let x = 0; x < T; x++) c.buf.set(c.ox + x, c.oy + y, s);
    const joint = Math.floor(hash2(c.x, c.y * 4 + row, 71) * T);
    for (let k = 0; k < 3; k++) c.buf.set(c.ox + joint, c.oy + row * 4 + k, s);
  }
  speckle(c, grain, 4, 72);
}

/** Square tiles with grout lines (bathroom floors, basement floors). */
export function grid(c: TileCtx, base: string, line: string, size: number): void {
  fill(c, base);
  const l = rgba(line);
  for (let i = 0; i < T; i++) {
    for (let k = 0; k < T; k += size) {
      c.buf.set(c.ox + k, c.oy + i, l);
      c.buf.set(c.ox + i, c.oy + k, l);
    }
  }
}

/**
 * A wall seen from above: a solid top with a darker front face along the side
 * that faces into a room below it, so walls look like they have height.
 */
export function wall(c: TileCtx, top: string, face: string, line: string): void {
  fill(c, top);
  const open = (dx: number, dy: number) => c.near(dx, dy) !== c.near(0, 0);
  const l = rgba(line);
  if (open(0, 1)) {
    rect(c, 0, 9, T, 7, face);
    for (let x = 0; x < T; x++) c.buf.set(c.ox + x, c.oy + 9, l);
  }
  // A thin dark line wherever the wall meets something else, so rooms look outlined.
  for (let i = 0; i < T; i++) {
    if (open(0, -1)) c.buf.set(c.ox + i, c.oy, l);
    if (open(-1, 0)) c.buf.set(c.ox, c.oy + i, l);
    if (open(1, 0)) c.buf.set(c.ox + T - 1, c.oy + i, l);
  }
}
