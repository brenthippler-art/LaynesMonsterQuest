import { type RidePart, type RidePlan } from '../../building/types';
import { pinwheelRows } from '../pinwheel';
import { mirror, recolor, Sketch, wrap } from './sketch';

/**
 * The rides that turn: the Ferris wheel on the hill, the carousel, and the
 * pinwheel sign over the front gate. Their pictures are drawn in code once,
 * when the game loads; each frame only picks which picture goes where.
 */
const TAU = Math.PI * 2;

// ---------- The Ferris wheel (7 x 7 squares on the hill) ----------
const WHEEL = { cx: 56, cy: 50, r: 42 };
const SPOKES = 8;
const WHEEL_FRAMES = 6; // the spokes look the same every 1/8 turn, so 6 pictures cover a smooth turn
const WHEEL_SPEED = TAU / 40; // one full turn every 40 seconds: slow and gentle

/** The legs and base the wheel stands on (they don't move). */
function wheelStand(): string[] {
  const s = new Sketch(112, 112);
  const { cx, cy } = WHEEL;
  for (const side of [-1, 1]) {
    s.line(cx, cy, cx + side * 30, 106, 'k', 4);
    s.line(cx, cy, cx + side * 30, 106, 'A', 2);
  }
  s.rect(18, 104, 76, 6, 'k');
  s.rect(19, 105, 74, 4, 'a');
  return s.rows();
}

/** The wheel itself (rim, spokes, hub), turned a little more in each picture. */
function wheelFrame(i: number): string[] {
  const s = new Sketch(112, 112);
  const { cx, cy, r } = WHEEL;
  const spin = (i / WHEEL_FRAMES) * (TAU / SPOKES);
  for (let k = 0; k < SPOKES; k++) {
    const a = spin + (k * TAU) / SPOKES;
    s.line(cx, cy, cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), 'a');
  }
  s.ring(cx, cy, r + 1, 4, 'k');
  s.ring(cx, cy, r, 2, 'w');
  s.ring(cx, cy, r * 0.55, 1, 'L'); // an inner ring of lights
  s.disc(cx, cy, 6, 'k');
  s.disc(cx, cy, 5, 'Y');
  s.dot(cx - 2, cy - 2, 'w');
  return s.rows();
}

/** One cabin: it always hangs straight down, whichever way the wheel turns. */
const CABIN = [
  '....kk....',
  '....kk....',
  '.kkkkkkkk.',
  'kBBBBBBBBk',
  'kBUUBBUUBk',
  'kBUUBBUUBk',
  'kBBBBBBBBk',
  '.kkkkkkkk.',
];
const CABIN_COLORS = ['r', 'u', 'Y', 'P'];

const wheel: RidePlan = {
  map: 'main', x: 5, y: 4, w: 7, h: 7,
  sprites: {
    stand: wheelStand(),
    ...Object.fromEntries(Array.from({ length: WHEEL_FRAMES }, (_, i) => [`wheel${i}`, wheelFrame(i)])),
    ...Object.fromEntries(CABIN_COLORS.map((c) => [`cabin${c}`, recolor(CABIN, { B: c })])),
  },
  pose(time) {
    const angle = time * WHEEL_SPEED;
    const step = TAU / SPOKES / WHEEL_FRAMES;
    const parts: RidePart[] = [
      { sprite: 'stand', x: 0, y: 0 },
      { sprite: `wheel${Math.floor(wrap(angle, TAU / SPOKES) / step) % WHEEL_FRAMES}`, x: 0, y: 0 },
    ];
    for (let k = 0; k < SPOKES; k++) {
      const a = angle + (k * TAU) / SPOKES;
      parts.push({ sprite: `cabin${CABIN_COLORS[k % CABIN_COLORS.length]}`, x: WHEEL.cx + Math.cos(a) * WHEEL.r - 5, y: WHEEL.cy + Math.sin(a) * WHEEL.r - 1 });
    }
    return parts;
  },
};

// ---------- The carousel (9 x 6 squares) ----------
/** A carousel horse, facing right, on its own (its golden pole is drawn separately). */
const HORSE = [
  '...kk.........',
  '..kHHk........',
  '.kHHkHPk......',
  'kHHHHHPPkkkkk.',
  '.kkHHHHHHHHHHk',
  '...kHHHPPPHHHP',
  '...kHHHPPPHHkP',
  '...kHHHHHHHHk.',
  '...kHk....kHk.',
  '...kk......kk.',
];
const HORSE_COLORS = ['w', 'L', 'U', 'y', 'w', 'p'];
const POLE_TOP = 30;
const CAROUSEL = { cx: 72, ry: 8, rx: 54, floor: 56, horses: 6, speed: TAU / 14 };

function canopy(): string[] {
  const s = new Sketch(144, 36);
  // A striped cone roof, wide at the bottom, with a scalloped edge and a flag on top.
  for (let y = 6; y < 30; y++) {
    const half = 8 + ((y - 6) / 24) * 62;
    for (let x = Math.round(72 - half); x <= Math.round(72 + half); x++) {
      const stripe = Math.floor(((x - 72) / half) * 5 + 50) % 2;
      s.dot(x, y, stripe ? 'r' : 'w');
    }
    s.dot(Math.round(72 - half) - 1, y, 'k');
    s.dot(Math.round(72 + half) + 1, y, 'k');
  }
  s.rect(9, 30, 126, 3, 'Y');
  for (let x = 10; x < 134; x += 8) s.disc(x + 4, 33, 2.5, 'r');
  s.line(72, 0, 72, 6, 'k', 2);
  s.rect(73, 0, 6, 4, 'P');
  return s.rows();
}

function carouselDeck(): string[] {
  const s = new Sketch(144, 40);
  for (let y = 0; y < 26; y++) {
    const half = 66 * Math.sqrt(Math.max(0, 1 - ((y - 13) / 13) ** 2));
    for (let x = Math.round(72 - half); x <= Math.round(72 + half); x++) s.dot(x, y + 8, y > 18 ? 'd' : 'o');
  }
  s.rect(4, 22, 136, 2, 'k');
  return s.rows();
}

function carouselCenter(): string[] {
  const s = new Sketch(14, 50);
  s.rect(0, 0, 14, 50, 'k');
  for (let y = 1; y < 49; y++) s.rect(1, y, 12, 1, Math.floor(y / 4) % 2 ? 'Y' : 'R');
  s.rect(4, 10, 6, 8, 'U'); // a little mirror on the center column
  return s.rows();
}

const pole = (h: number) => Array.from({ length: h }, () => 'Y');

const carousel: RidePlan = {
  map: 'main', x: 9, y: 51, w: 9, h: 6,
  sprites: {
    canopy: canopy(),
    deck: carouselDeck(),
    center: carouselCenter(),
    pole: pole(40),
    ...Object.fromEntries(HORSE_COLORS.flatMap((c, k) => [[`horseR${k}`, recolor(HORSE, { H: c })], [`horseL${k}`, mirror(recolor(HORSE, { H: c }))]])),
  },
  pose(time) {
    const { cx, rx, ry, floor, horses, speed } = CAROUSEL;
    const back: RidePart[] = [];
    const front: RidePart[] = [];
    for (let k = 0; k < horses; k++) {
      const a = time * speed + (k * TAU) / horses;
      const depth = Math.cos(a); // > 0: in front of the center column
      const x = cx + Math.sin(a) * rx;
      const bob = Math.sin(time * 2.4 + k * 1.7) * 3; // up and down, like a real carousel horse
      const y = floor + depth * ry - 14 + bob;
      const list = depth > 0 ? front : back;
      list.push({ sprite: 'pole', x: x, y: POLE_TOP }, { sprite: `${depth > 0 ? 'horseR' : 'horseL'}${k}`, x: x - 7, y });
    }
    return [
      { sprite: 'deck', x: 0, y: 52 },
      ...back,
      { sprite: 'center', x: 65, y: 30 },
      ...front,
      { sprite: 'canopy', x: 0, y: 0 },
    ];
  },
};

// ---------- The pinwheel sign over the front gate (2 x 2 squares) ----------
const SIGN_FRAMES = 16;
const SIGN_SPEED = TAU / 6; // one turn every 6 seconds
const SIGN_SYMMETRY = TAU / 3; // 3 colors going round twice: it looks the same every 1/3 turn

const sign: RidePlan = {
  map: 'main', x: 44, y: 69, w: 2, h: 2,
  sprites: Object.fromEntries(Array.from({ length: SIGN_FRAMES }, (_, i) => [`spin${i}`, pinwheelRows(30, (i / SIGN_FRAMES) * SIGN_SYMMETRY, 'rYb', 'w')])),
  pose(time) {
    const i = Math.floor((wrap(time * SIGN_SPEED, SIGN_SYMMETRY) / SIGN_SYMMETRY) * SIGN_FRAMES) % SIGN_FRAMES;
    return [{ sprite: `spin${i}`, x: 1, y: 1 }];
  },
};

export const SPINNING_RIDES: RidePlan[] = [wheel, carousel, sign];
