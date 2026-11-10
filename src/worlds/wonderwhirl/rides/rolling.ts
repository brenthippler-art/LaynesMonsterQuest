import { type RidePart, type RidePlan } from '../../building/types';
import { mirror, recolor, turn, wrap } from './sketch';

/**
 * The rides that roll and slide: the roller-coaster train going round its track,
 * the bumper cars wandering their floor, and the floating tubes on the lazy river.
 */

/** A point that goes round a rectangle (corners at x0,y0 and x1,y1) at `d` pixels from the top-left, clockwise. */
function aroundBox(d: number, x0: number, y0: number, x1: number, y1: number): { x: number; y: number; across: boolean } {
  const w = x1 - x0;
  const h = y1 - y0;
  const p = wrap(d, 2 * (w + h));
  if (p < w) return { x: x0 + p, y: y0, across: true };
  if (p < w + h) return { x: x1, y: y0 + p - w, across: false };
  if (p < 2 * w + h) return { x: x1 - (p - w - h), y: y1, across: true };
  return { x: x0, y: y1 - (p - 2 * w - h), across: false };
}

// ---------- The roller coaster (its track is the ring of 'r' squares in layout.ts) ----------
/** A coaster car seen from above: red, with two seats and a gold stripe. */
const CAR = [
  '.kkkkkkkkkkkk.',
  'krrrrrrrrrrrrk',
  'kraakraakrrYrk',
  'kraakraakrrYrk',
  'krrrrrrrrrrYrk',
  'kraakraakrrYrk',
  'kraakraakrrYrk',
  'krrrrrrrrrrrrk',
  '.kkkkkkkkkkkk.',
];
// The track's middle line, in pixels from the ride's top-left corner (the middle of each 'r' square).
const LOOP = { x0: 8, y0: 8, x1: 344, y1: 120 };
const LOOP_LENGTH = 2 * (LOOP.x1 - LOOP.x0 + LOOP.y1 - LOOP.y0);
const COASTER_SPEED = 56; // pixels a second: about 16 seconds round the track
const STATION_X = (14.5 - 4) * 16; // the middle of the station (squares 12-17), in pixels from the ride's left edge
const STATION_AT = LOOP.x1 - LOOP.x0 + (LOOP.y1 - LOOP.y0) + (LOOP.x1 - STATION_X); // how far round the track that is
const STATION_WAIT = 2.5; // seconds the train waits at the station
const CARS = 3;
const CAR_GAP = 16;

/** How far along the track the train's front car is: rolling, then a little stop at the station. */
function trainAt(time: number): number {
  const lap = LOOP_LENGTH / COASTER_SPEED + STATION_WAIT;
  const t = wrap(time, lap);
  const arrive = STATION_AT / COASTER_SPEED;
  if (t < arrive) return t * COASTER_SPEED;
  if (t < arrive + STATION_WAIT) return STATION_AT;
  return (t - STATION_WAIT) * COASTER_SPEED;
}

const coaster: RidePlan = {
  map: 'main', x: 4, y: 28, w: 22, h: 8,
  sprites: { across: CAR, down: turn(CAR), acrossBack: mirror(CAR) },
  pose(time) {
    const front = trainAt(time);
    const parts: RidePart[] = [];
    for (let k = 0; k < CARS; k++) {
      const d = front - k * CAR_GAP;
      const p = aroundBox(d, LOOP.x0, LOOP.y0, LOOP.x1, LOOP.y1);
      const goingLeft = p.across && p.y > LOOP.y0; // the bottom straight goes right to left
      parts.push(p.across ? { sprite: goingLeft ? 'acrossBack' : 'across', x: p.x - 7, y: p.y - 4 } : { sprite: 'down', x: p.x - 4, y: p.y - 7 });
    }
    return parts;
  },
};

// ---------- The bumper cars (the dark 'a' floor in layout.ts, 16 x 9 squares) ----------
/** A round bumper car seen from above, with its pole and a little spark on top. */
const BUMPER = [
  '......kk......',
  '.....kYYk.....',
  '..kkkkkkkkkk..',
  '.kAAAAAAAAAAk.',
  'kAkBBBBBBBBkAk',
  'kAkBwBBBBBBkAk',
  'kAkBBBaaBBBkAk',
  'kAkBBBaaBBBkAk',
  'kAkBBBBBBBBkAk',
  '.kAAAAAAAAAAk.',
  '..kkkkkkkkkk..',
];
const BUMPER_COLORS = ['b', 'r', 'Y', 'g', 'P'];
const ARENA = { w: 256, h: 144 };
/** Each car glides along its own slow wobbly loop, so they drift close and gently bonk. */
const LOOPS = [
  { fx: 0.21, fy: 0.33, px: 0, py: 1 },
  { fx: 0.27, fy: 0.19, px: 2, py: 0.5 },
  { fx: 0.17, fy: 0.29, px: 4, py: 3 },
  { fx: 0.31, fy: 0.23, px: 1, py: 5 },
  { fx: 0.23, fy: 0.37, px: 5, py: 2 },
];

const bumper: RidePlan = {
  map: 'main', x: 67, y: 5, w: 16, h: 9,
  sprites: {
    ...Object.fromEntries(BUMPER_COLORS.map((c, k) => [`car${k}`, recolor(BUMPER, { B: c })])),
    ...Object.fromEntries(BUMPER_COLORS.map((c, k) => [`zap${k}`, recolor(BUMPER, { B: c, Y: 'w' })])),
  },
  pose(time) {
    return LOOPS.map((l, k) => ({
      // The spark on the pole flickers between gold and white.
      sprite: `${Math.floor(time * 4 + k) % 3 === 0 ? 'zap' : 'car'}${k}`,
      x: (ARENA.w - 14) / 2 + Math.sin(time * l.fx + l.px) * ((ARENA.w - 30) / 2),
      y: (ARENA.h - 11) / 2 + Math.sin(time * l.fy + l.py) * ((ARENA.h - 26) / 2),
    }));
  },
};

// ---------- Floating tubes on the lazy river (the ring of '~' squares in layout.ts) ----------
const TUBE = [
  '..kkkkkk..',
  '.kYYYYYYk.',
  'kYYkkkkYYk',
  'kYk.hh.kYk',
  'kYYkkkkYYk',
  '.kYYYYYYk.',
  '..kkkkkk..',
];
const TUBE_COLORS = ['Y', 'P', 'O', 'm'];
const RIVER = { x0: 16, y0: 16, x1: 336, y1: 208 };
const RIVER_LENGTH = 2 * (RIVER.x1 - RIVER.x0 + RIVER.y1 - RIVER.y0);
const TUBES = 8;
/** A little white ripple drifting across the wave pool. */
const RIPPLE = ['.wwww.', 'w....w'];

const river: RidePlan = {
  map: 'main', x: 64, y: 27, w: 22, h: 14,
  sprites: { ...Object.fromEntries(TUBE_COLORS.map((c, k) => [`tube${k}`, recolor(TUBE, { Y: c })])), ripple: RIPPLE },
  pose(time) {
    const parts: RidePart[] = [];
    for (let k = 0; k < TUBES; k++) {
      const p = aroundBox(time * 10 + (k * RIVER_LENGTH) / TUBES, RIVER.x0, RIVER.y0, RIVER.x1, RIVER.y1); // 10 pixels a second: lazy!
      parts.push({ sprite: `tube${k % TUBE_COLORS.length}`, x: p.x - 5, y: p.y - 3 + Math.sin(time * 2 + k) });
    }
    // Ripples roll across the wave pool, under the slide towers.
    for (let k = 0; k < 6; k++) {
      parts.push({ sprite: 'ripple', x: 40 + wrap(time * 12 + k * 47, 270), y: 112 + (k % 3) * 30 });
    }
    return parts;
  },
};

export const ROLLING_RIDES: RidePlan[] = [coaster, bumper, river];
