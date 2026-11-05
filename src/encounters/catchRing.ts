import { type Rarity } from '../monsters/monsterTypes';
import { NES } from '../render/nesPalette';
import { PixelBuffer, rgba } from '../render/pixels';

/**
 * The catch mini-game: a golden ring shrinks toward a green "sweet zone".
 * Tap when the ring is inside the zone. The ring glows white while it's in
 * the zone, so the right moment is easy to see.
 *
 * Sizes are "scale": 1 = exactly on the middle of the zone.
 */
export interface CatchRules {
  /** How far (in scale) from the zone's middle still counts. Bigger = easier. */
  zone: number;
  /** Seconds for the ring to shrink from big to small. Bigger = slower = easier. */
  seconds: number;
}

/** Everyone gets a wide zone and a slow ring; rare monsters are a little trickier, still very doable. */
export const RULES: Record<Rarity, CatchRules> = {
  common: { zone: 0.2, seconds: 3.2 },
  uncommon: { zone: 0.17, seconds: 2.9 },
  rare: { zone: 0.13, seconds: 2.4 },
};

export const START_SCALE = 1.65;
export const END_SCALE = 0.35;

/** Ring size `t` seconds into a shrink (it starts over when it gets small). */
export function ringScale(t: number, rules: CatchRules): number {
  const k = (t % rules.seconds) / rules.seconds;
  return START_SCALE - (START_SCALE - END_SCALE) * k;
}

export function inZone(scale: number, rules: CatchRules): boolean {
  return Math.abs(scale - 1) <= rules.zone;
}

/** The ring is drawn on a tiny canvas and scaled up, so it's chunky pixel art too. */
export const RING_CANVAS = 96;
const CENTER = RING_CANVAS / 2;
const RADIUS = 28; // the zone's middle, in canvas pixels

const ZONE = rgba(NES.greenBright);
const ZONE_EDGE = rgba(NES.green);
const RING = rgba(NES.gold);
const RING_EDGE = rgba(NES.black);
const GLOW = rgba(NES.white);

/** Draw the zone (and the ring, if `scale` is given) into the canvas. */
export function drawRing(canvas: HTMLCanvasElement, rules: CatchRules, scale: number | null): void {
  const buf = new PixelBuffer(RING_CANVAS, RING_CANVAS);
  const inner = RADIUS * (1 - rules.zone);
  const outer = RADIUS * (1 + rules.zone);
  const glowing = scale !== null && inZone(scale, rules);
  const r = scale === null ? -99 : RADIUS * scale;

  for (let y = 0; y < RING_CANVAS; y++) {
    for (let x = 0; x < RING_CANVAS; x++) {
      const d = Math.hypot(x + 0.5 - CENTER, y + 0.5 - CENTER);
      // Moving ring: 3 pixels thick with a dark edge so it shows on any background.
      if (Math.abs(d - r) < 1.5) buf.set(x, y, glowing ? GLOW : RING);
      else if (Math.abs(d - r) < 2.5) buf.set(x, y, RING_EDGE);
      // Sweet zone: solid edges, checkerboard inside (old-console see-through).
      else if (Math.abs(d - inner) < 0.6 || Math.abs(d - outer) < 0.6) buf.set(x, y, ZONE_EDGE);
      else if (d > inner && d < outer && (x + y) % 2 === 0) buf.set(x, y, glowing ? GLOW : ZONE);
    }
  }
  canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(buf.data.buffer), RING_CANVAS, RING_CANVAS), 0, 0);
}
