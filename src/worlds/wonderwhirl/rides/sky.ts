import { type RidePart, type RidePlan } from '../../building/types';
import { Sketch, wrap } from './sketch';

/**
 * The gentle "just for looking" animations: fireworks in the night sky over the
 * show stage, clouds drifting over the Ferris-wheel hill, the fountain in the middle
 * of the park, and the stripes rolling round the funhouse's spinning tunnel.
 */
const TAU = Math.PI * 2;

// ---------- Fireworks over the stage (the night sky, 28 x 7 squares) ----------
/** A burst of sparks: 12 rays of dots, `size` pixels across, in two colors (outer, inner). */
function burst(size: number, outer: string, inner: string, dotsOnly = false): string[] {
  const s = new Sketch(size, size);
  const c = (size - 1) / 2;
  for (let k = 0; k < 12; k++) {
    const a = (k * TAU) / 12;
    for (let d = dotsOnly ? c : 2; d <= c; d += dotsOnly ? 1 : 2) s.dot(c + Math.cos(a) * d, c + Math.sin(a) * d, d > c * 0.6 ? outer : inner);
  }
  if (!dotsOnly) s.dot(c, c, 'w');
  return s.rows();
}
const SHOW_COLORS = [['r', 'Y'], ['P', 'w'], ['u', 'U'], ['l', 'y'], ['Y', 'w'], ['L', 'P']];
const STAGES = [9, 17, 27]; // a burst grows in three steps, then twinkles away
const SKY = { w: 28 * 16, h: 7 * 16 };
const SHOWS = 5;
const SHOW_TIME = 5; // seconds for one firework, from launch to the last twinkle

const fireworks: RidePlan = {
  map: 'main', x: 31, y: 1, w: 28, h: 7,
  sprites: {
    trail: ['w', 'y', 'o', 'O'],
    ...Object.fromEntries(
      SHOW_COLORS.flatMap(([o, i], k) => [
        ...STAGES.map((size, n) => [`b${k}-${n}`, burst(size, o, i)]),
        [`b${k}-twinkle`, burst(27, o, '.', true)],
      ]),
    ),
  },
  pose(time) {
    const parts: RidePart[] = [];
    for (let k = 0; k < SHOWS; k++) {
      const t = time + (k * SHOW_TIME) / SHOWS;
      const round = Math.floor(t / SHOW_TIME); // a new spot and color every time this firework goes up
      const s = wrap(t, SHOW_TIME) / SHOW_TIME;
      const pick = (round * 7 + k * 3) % SHOW_COLORS.length;
      const x = 24 + (((round * 97 + k * 61) % 9) / 8) * (SKY.w - 48);
      const y = 22 + ((round * 31 + k * 17) % 4) * 8;
      if (s < 0.3) parts.push({ sprite: 'trail', x, y: SKY.h - 6 - (s / 0.3) * (SKY.h - 6 - y) });
      else if (s < 0.4) parts.push({ sprite: `b${pick}-0`, x: x - 4, y: y - 4 });
      else if (s < 0.52) parts.push({ sprite: `b${pick}-1`, x: x - 8, y: y - 8 });
      else if (s < 0.7) parts.push({ sprite: `b${pick}-2`, x: x - 13, y: y - 13 });
      else if (s < 0.85) parts.push({ sprite: `b${pick}-twinkle`, x: x - 13, y: y - 11 }); // the sparks drift down a little
      // ...and then a quiet moment before the next one goes up.
    }
    return parts;
  },
};

// ---------- Clouds over the Ferris-wheel hill (the day sky, 28 x 2 squares) ----------
function cloud(w: number): string[] {
  const s = new Sketch(w, 12);
  s.disc(w * 0.3, 7, 4.5, 'w');
  s.disc(w * 0.55, 5, 5.5, 'w');
  s.disc(w * 0.75, 7, 4, 'w');
  s.rect(Math.round(w * 0.2), 8, Math.round(w * 0.65), 4, 'w');
  s.rect(Math.round(w * 0.22), 11, Math.round(w * 0.6), 1, 'U');
  return s.rows();
}
const CLOUDS = [
  { sprite: 'big', x: 40, y: 6, sway: 30, speed: 0.07 },
  { sprite: 'small', x: 190, y: 14, sway: 40, speed: 0.05 },
  { sprite: 'big', x: 330, y: 4, sway: 34, speed: 0.06 },
];

const clouds: RidePlan = {
  map: 'main', x: 1, y: 1, w: 28, h: 2,
  sprites: { big: cloud(30), small: cloud(22) },
  // Clouds drift slowly back and forth (never off the edge, so they never pop in or out).
  pose: (time) => CLOUDS.map((c, k) => ({ sprite: c.sprite, x: c.x + Math.sin(time * c.speed + k * 2) * c.sway, y: c.y })),
};

// ---------- The fountain in the middle of the park (4 x 4 squares) ----------
/** The tall jet in the middle: it sparkles in three pictures. */
function jet(frame: number): string[] {
  const s = new Sketch(8, 22);
  s.rect(2, 0, 4, 22, 'U');
  s.rect(3, 0, 2, 22, 'w');
  for (let y = frame * 3; y < 22; y += 7) s.rect(1, y, 6, 2, 'w');
  s.rect(0, 0, 8, 3, 'U');
  return s.rows();
}
const DROPS = 10;

const fountain: RidePlan = {
  map: 'main', x: 43, y: 33, w: 4, h: 4,
  sprites: { jet0: jet(0), jet1: jet(1), jet2: jet(2), drop: ['ww', 'UU'] },
  pose(time) {
    const parts: RidePart[] = [{ sprite: `jet${Math.floor(time * 6) % 3}`, x: 28, y: 12 }];
    // Drops arc out of the top of the jet and fall back into the basin, all the way round.
    for (let k = 0; k < DROPS; k++) {
      const s = wrap(time * 0.9 + k / DROPS, 1);
      const a = (k * TAU) / DROPS;
      parts.push({ sprite: 'drop', x: 31 + Math.cos(a) * 20 * s, y: 13 + Math.sin(a) * 10 * s - Math.sin(Math.PI * s) * 10 + s * 24 });
    }
    return parts;
  },
};

// ---------- The funhouse's spinning tunnel (its two sides, 22 x 1 squares each) ----------
const STRIPE_COLORS = 'PYuL';
const STRIPE_WIDTH = 6;
const STRIPE_FRAMES = (STRIPE_COLORS.length * STRIPE_WIDTH) / 2; // 2 pixels a picture, until the pattern repeats
/** Rainbow stripes leaning sideways; each picture is shifted 2 pixels, so they seem to roll. */
function stripes(frame: number, way: 1 | -1): string[] {
  const period = STRIPE_COLORS.length * STRIPE_WIDTH;
  const s = new Sketch(22 * 16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 22 * 16; x++) s.dot(x, y, STRIPE_COLORS[Math.floor(wrap(x + y - way * frame * 2, period) / STRIPE_WIDTH)]);
  }
  s.rect(0, 0, 22 * 16, 1, 'k');
  s.rect(0, 15, 22 * 16, 1, 'k');
  return s.rows();
}
const tunnelSide = (y: number, way: 1 | -1): RidePlan => ({
  map: 'funhouse', x: 4, y, w: 22, h: 1,
  sprites: Object.fromEntries(Array.from({ length: STRIPE_FRAMES }, (_, i) => [`roll${i}`, stripes(i, way)])),
  pose: (time) => [{ sprite: `roll${Math.floor(time * 10) % STRIPE_FRAMES}`, x: 0, y: 0 }],
});

export const SKY_RIDES: RidePlan[] = [fireworks, clouds, fountain, tunnelSide(8, 1), tunnelSide(11, -1)];
