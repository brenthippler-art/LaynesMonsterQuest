import { BASE_RX, BASE_RY, type Body, CENTER_X, densify, GROUND_Y, type Pt, ring, sharpPath, smoothPath, TAU } from './bodyKit';
import { type CreatureShape, makeCreatureBody } from './creatureBodies';
import { makeObjectBody, type ObjectShape } from './objectBodies';

export { type Body, CENTER_X, GROUND_Y } from './bodyKit';

/**
 * Body shapes. Every body is built from points around an ellipse (center
 * cx/cy, half-width rx, half-height ry), bent into a shape. The points also
 * tell the other parts where to attach: "how high is the head at this x?"
 *
 * The animal bodies with separate heads live in creatureBodies.ts, and the
 * "living object" bodies in objectBodies.ts.
 */
export type BodyShape = RoundishShape | CreatureShape | ObjectShape;

type RoundishShape =
  | 'round' // a ball
  | 'pear' // narrow top, wide bottom
  | 'tall' // a standing bean
  | 'square' // a soft box
  | 'long' // wide and low, like a four-legged animal
  | 'drop' // pointy top, like a water drop or flame
  | 'cloud' // fluffy scalloped edge (arctic fluff)
  | 'spiky' // spikes on the top half (desert)
  | 'blob' // wobbly drippy bottom (swamp slime)
  | 'crystal'; // a gem with flat sides (ice, caves)

/** sign-preserving power: rounds an ellipse into a soft box (e < 1) */
const spow = (v: number, e: number) => Math.sign(v) * Math.abs(v) ** e;

function outline(shape: RoundishShape, cx: number, cy: number, rx: number, ry: number): { points: Pt[]; sharp: boolean } {
  const oval = (t: number, kx = 1, ky = 1): Pt => ({ x: cx + rx * Math.cos(t) * kx, y: cy + ry * Math.sin(t) * ky });
  switch (shape) {
    case 'round':
    case 'long':
      return { points: ring(48, (t) => oval(t)), sharp: false };
    case 'tall':
      return { points: ring(48, (t) => ({ x: cx + rx * spow(Math.cos(t), 0.75), y: cy + ry * Math.sin(t) })), sharp: false };
    case 'pear':
      return { points: ring(48, (t) => oval(t, 0.86 + 0.16 * Math.sin(t))), sharp: false };
    case 'square':
      return { points: ring(48, (t) => ({ x: cx + rx * spow(Math.cos(t), 0.5), y: cy + ry * spow(Math.sin(t), 0.5) })), sharp: false };
    case 'drop':
      return {
        points: ring(48, (t) => {
          const s = Math.sin(t);
          return s < 0 ? oval(t, 1 + 0.78 * s, 1.18) : oval(t);
        }),
        sharp: false,
      };
    case 'cloud':
      return { points: ring(96, (t) => { const k = 1 + 0.075 * Math.abs(Math.sin(t * 6)); return oval(t, k, k); }), sharp: false };
    case 'blob':
      return {
        points: ring(64, (t) => {
          const s = Math.sin(t);
          const k = s > 0.2 ? 1 + 0.07 * Math.sin(t * 10) * ((s - 0.2) / 0.8) : 1;
          return oval(t, k, k);
        }),
        sharp: false,
      };
    case 'spiky': {
      // 16 spikes around, 6 points each (so every tip and dip is exactly hit).
      const per = 6;
      const total = 16 * per;
      return {
        points: ring(total, (t) => {
          const i = Math.round(((t + Math.PI / 2) / TAU) * total);
          const w = (i % per) / per;
          const tri = 1 - Math.abs(2 * w - 1);
          const onTop = Math.min(1, Math.max(0, (0.3 - Math.sin(t)) / 0.5)); // spikes fade out toward the bottom
          const k = 1 + 0.2 * tri * onTop;
          return oval(t, k, k);
        }),
        sharp: true,
      };
    }
    case 'crystal':
      return {
        points: [
          { x: cx, y: cy - ry * 1.12 },
          { x: cx + rx * 0.98, y: cy - ry * 0.42 },
          { x: cx + rx * 0.9, y: cy + ry * 0.55 },
          { x: cx, y: cy + ry },
          { x: cx - rx * 0.9, y: cy + ry * 0.55 },
          { x: cx - rx * 0.98, y: cy - ry * 0.42 },
        ],
        sharp: true,
      };
  }
}

const CREATURES: readonly string[] = ['dragon', 'serpent', 'beast', 'bird'] satisfies CreatureShape[];
const OBJECTS: readonly string[] = ['bowl', 'appliance', 'cart'] satisfies ObjectShape[];

export function makeBody(shape: BodyShape, scale: number): Body {
  if (CREATURES.includes(shape)) return makeCreatureBody(shape as CreatureShape, scale);
  if (OBJECTS.includes(shape)) return makeObjectBody(shape as ObjectShape, scale);
  return makeRoundishBody(shape as RoundishShape, scale);
}

function makeRoundishBody(shape: RoundishShape, scale: number): Body {
  let rx = BASE_RX * scale;
  let ry = BASE_RY * scale;
  if (shape === 'tall') {
    rx *= 0.82;
    ry *= 1.12;
  }
  if (shape === 'long') {
    rx *= 1.22;
    ry *= 0.8;
  }
  const cx = CENTER_X;
  const cy = GROUND_Y - ry;
  const { points, sharp } = outline(shape, cx, cy, rx, ry);
  const dense = densify(points, 8);
  const xs = dense.map((q) => q.x);
  const ys = dense.map((q) => q.y);

  return {
    d: sharp ? sharpPath(points) : smoothPath(points),
    cx,
    cy,
    rx,
    ry,
    top: Math.min(...ys),
    bottom: Math.max(...ys),
    left: Math.min(...xs),
    right: Math.max(...xs),
    topYAt(x) {
      let best = Infinity;
      let y = cy - ry;
      for (const q of dense) {
        if (q.y < cy && Math.abs(q.x - x) < best) {
          best = Math.abs(q.x - x);
          y = q.y;
        }
      }
      return y;
    },
    sideXAt(y, side) {
      let best = Infinity;
      let x = cx + side * rx;
      for (const q of dense) {
        if (side * (q.x - cx) > 0 && Math.abs(q.y - y) < best) {
          best = Math.abs(q.y - y);
          x = q.x;
        }
      }
      return x;
    },
  };
}
