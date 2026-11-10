import { rect } from '../building/paint';
import { type TileCtx } from '../building/types';

/**
 * Wonderwhirl Park's own sign: a swirly pinwheel, drawn in code (so it's nobody
 * else's logo). Its blades curl as they go out, like a lollipop swirl.
 *
 * pinwheelPick() says which blade a pixel is on: dx, dy = how far from the middle,
 * r = how big, turn = how far it has spun (in radians). -1 = outside the pinwheel.
 */
const BLADES = 6;
const CURL = 2.2; // how much the blades curl toward the edge

export function pinwheelPick(dx: number, dy: number, r: number, turn: number): number {
  const d = Math.hypot(dx, dy);
  if (d > r) return -1;
  if (d < r * 0.18) return BLADES; // the round middle
  const a = Math.atan2(dy, dx) - turn + (CURL * d) / r;
  const slice = (((a / (Math.PI * 2)) * BLADES) % BLADES + BLADES) % BLADES;
  return Math.floor(slice);
}

/**
 * The pinwheel as rows of decoration letters (for the spinning sign and the world card).
 * `letters` = the blades' colors, going round; `middle` = the dot in the center.
 */
export function pinwheelRows(size: number, turn: number, letters: string, middle: string, rim = 'k'): string[] {
  const r = size / 2 - 0.5;
  const rows: string[] = [];
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      const dx = x - r;
      const dy = y - r;
      const pick = pinwheelPick(dx, dy, r, turn);
      if (pick < 0) row += '.';
      else if (Math.hypot(dx, dy) > r - 1) row += rim; // a dark outline round the edge
      else row += pick === BLADES ? middle : letters[pick % letters.length];
    }
    rows.push(row);
  }
  return rows;
}

/** A small pinwheel painted straight into a tile (the swirls on the sign board). */
export function drawPinwheel(c: TileCtx, cx: number, cy: number, r: number, turn: number, colors: string[]): void {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const pick = pinwheelPick(x, y, r, turn);
      if (pick >= 0 && pick < BLADES && pick % 2 === 0) rect(c, cx + x, cy + y, 1, 1, colors[(pick / 2) % colors.length]);
    }
  }
}
