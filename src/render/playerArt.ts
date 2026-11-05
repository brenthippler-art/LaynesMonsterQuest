import { type GlassesStyle } from '../player/glasses';
import { type Facing } from '../player/player';
import { SPRITE_H, SPRITE_W, spriteRows } from './layneSprites';
import { NES } from './nesPalette';
import { PixelBuffer, rgba, stamp } from './pixels';

/**
 * Turns Layne's pixel grids (layneSprites.ts) into little images, then draws
 * them at the same pixel scale as the world.
 */
export const LAYNE_PALETTE: Record<string, string> = {
  o: NES.black, // outline
  h: NES.gold, // hair
  H: NES.yellowLight, // hair highlight
  d: NES.ochre, // hair shadow
  s: NES.skin, // skin
  S: NES.orangeLight, // ear
  c: NES.salmon, // cheek
  m: NES.red, // mouth
  e: NES.blue, // blue eye
  w: NES.white, // eye sparkle
  L: NES.skyLight, // lens (tinted so white frames still show)
  r: NES.redBright, // red stripe
  W: NES.white, // white stripe
  b: NES.blueDark, // backpack
  B: NES.periwinkle, // backpack light
  y: NES.gold, // buckle
  n: NES.brownRed, // shorts
  u: NES.blueMid, // shoe
  U: NES.white, // sole
};
const RAINBOW = [NES.redBright, NES.orange, NES.gold, NES.green, NES.blueMid, NES.purple];

/** Color for one glasses-frame pixel. Patterns are painted pixel by pixel. */
function glassesColor(ch: string, x: number, y: number, g: GlassesStyle): string {
  switch (g.pattern) {
    case 'solid':
      return g.color;
    case 'twoTone':
      return ch === 'g' ? g.accent : g.color;
    case 'stripes':
      return y % 2 ? g.accent : g.color;
    case 'dots':
      return (x + y) % 3 === 0 ? g.accent : g.color;
    case 'rainbow':
      return RAINBOW[(x + y) % RAINBOW.length];
  }
}

function buildSprite(facing: Facing, frame: number, glasses: GlassesStyle): HTMLCanvasElement {
  const buf = new PixelBuffer(SPRITE_W, SPRITE_H);
  const rows = spriteRows(facing === 'left' ? 'right' : facing, frame);
  stamp(
    buf,
    rows,
    (ch, x, y) => rgba(ch === 'G' || ch === 'g' ? glassesColor(ch, x, y, glasses) : LAYNE_PALETTE[ch]),
    0,
    0,
    facing === 'left', // left = the right-facing picture, mirrored
  );
  return buf.toCanvas();
}

/** Each pose is built once and reused (16 tiny images at most). */
const sprites = new Map<string, HTMLCanvasElement>();
let spritesGlasses: GlassesStyle | null = null;

/**
 * Draw Layne with his feet at (screenX, screenY), in device pixels.
 * pixelPx = screen pixels per art pixel (same as the world's).
 * frame 0..3 is the walk cycle (1 and 3 are mid-step).
 */
export function drawLayne(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  pixelPx: number,
  facing: Facing,
  frame: number,
  glasses: GlassesStyle,
): void {
  if (glasses !== spritesGlasses) {
    sprites.clear();
    spritesGlasses = glasses;
  }
  const key = `${facing}${frame}`;
  let sprite = sprites.get(key);
  if (!sprite) {
    sprite = buildSprite(facing, frame, glasses);
    sprites.set(key, sprite);
  }
  const w = SPRITE_W * pixelPx;
  const h = SPRITE_H * pixelPx;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sprite, screenX - w / 2, screenY - h, w, h);
}
