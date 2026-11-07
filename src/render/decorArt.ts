import { TILE_PIXELS } from '../config';
import { hash2 } from '../core/rng';
import { type Decor } from '../world/decorations';
import { DECOR_SPRITES } from './decorSprites';
import { NES } from './nesPalette';
import { rgba, type ColorOf, type PixelBuffer, stamp } from './pixels';

/** Letter → color for decoration grids (also used by the biome icons). */
export const SPRITE_COLORS: Record<string, string> = {
  b: NES.blue,
  s: NES.sand,
  k: NES.black,
  w: NES.white,
  l: NES.greenBright,
  g: NES.green,
  G: NES.greenForest,
  n: NES.brownRed,
  N: NES.brownDark,
  a: NES.grayLight,
  A: NES.gray,
  r: NES.redBright,
  O: NES.orange,
  Y: NES.gold,
  u: NES.sky,
  U: NES.skyLight,
  p: NES.pinkLight,
  P: NES.pink,
  // Added for building worlds (furniture needs more colors):
  v: NES.purple,
  L: NES.lavender,
  y: NES.yellowLight,
  o: NES.orangeLight,
  d: NES.ochre,
  t: NES.teal,
  R: NES.red,
  B: NES.blueDark,
  i: NES.periwinkle,
  h: NES.skin,
  m: NES.mint,
  e: NES.rose,
};
const FLOWER_COLORS = [NES.pink, NES.gold, NES.lavender, NES.redBright, NES.white];
const CRYSTAL_COLORS = [NES.skyLight, NES.lavender, NES.pinkLight];

/**
 * Draw one decoration into the 16x16 tile whose top-left is (ox, oy).
 * Tall things stand on the bottom of the tile; small things sit somewhere
 * inside it. Each one is nudged a pixel or two so rows don't look stamped.
 */
export function drawDecor(buf: PixelBuffer, d: Decor, x: number, y: number, ox: number, oy: number): void {
  const sprite = DECOR_SPRITES[d];
  if (!sprite) return;
  const w = sprite[0].length;
  const h = sprite.length;
  const roll = hash2(x, y, 99);

  const flower = rgba(FLOWER_COLORS[Math.floor(roll * FLOWER_COLORS.length)]);
  const crystal = rgba(CRYSTAL_COLORS[Math.floor(roll * CRYSTAL_COLORS.length)]);
  const colorOf: ColorOf = (ch) => (ch === 'f' ? flower : ch === 'c' ? crystal : rgba(SPRITE_COLORS[ch]));

  const spareX = TILE_PIXELS - w;
  const spareY = TILE_PIXELS - h;
  const px = ox + Math.floor(spareX / 2) + (spareX >= 2 ? Math.round((roll - 0.5) * 2) : 0);
  const py = oy + (h >= 12 ? spareY : Math.floor(hash2(y, x, 98) * (spareY + 1)));
  stamp(buf, sprite, colorOf, px, py, roll < 0.5 && h < 16);
}
