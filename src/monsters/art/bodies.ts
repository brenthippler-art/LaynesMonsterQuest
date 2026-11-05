import { n } from './pen';

/**
 * Body shapes. Every body is built from points around an ellipse (center
 * cx/cy, half-width rx, half-height ry), bent into a shape. The points also
 * tell the other parts where to attach: "how high is the head at this x?"
 */
export type BodyShape =
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

interface Pt {
  x: number;
  y: number;
}

export interface Body {
  d: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** y of the body's top edge at this x (where ears and horns attach). */
  topYAt(x: number): number;
  /** x of the body's left (-1) or right (1) edge at this y (where arms and tails attach). */
  sideXAt(y: number, side: 1 | -1): number;
}

/** Everything stands on this line; the picture is 250 wide x 210 tall. */
export const CENTER_X = 100;
export const GROUND_Y = 166;
const BASE_RX = 54;
const BASE_RY = 48;
const TAU = Math.PI * 2;

/** sign-preserving power: rounds an ellipse into a soft box (e < 1) */
const spow = (v: number, e: number) => Math.sign(v) * Math.abs(v) ** e;

/** N points around the shape, starting at the top and going clockwise. */
function ring(count: number, at: (t: number) => Pt): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) out.push(at(-Math.PI / 2 + (i / count) * TAU));
  return out;
}

function outline(shape: BodyShape, cx: number, cy: number, rx: number, ry: number): { points: Pt[]; sharp: boolean } {
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

/** Straight lines between points (spikes, gems). */
function sharpPath(p: Pt[]): string {
  return p.map((q, i) => `${i ? 'L' : 'M'}${n(q.x)} ${n(q.y)}`).join(' ') + ' Z';
}

/** A smooth curve through all the points (Catmull-Rom turned into Bézier curves). */
function smoothPath(p: Pt[]): string {
  const len = p.length;
  let d = `M${n(p[0].x)} ${n(p[0].y)}`;
  for (let i = 0; i < len; i++) {
    const p0 = p[(i - 1 + len) % len];
    const p1 = p[i];
    const p2 = p[(i + 1) % len];
    const p3 = p[(i + 2) % len];
    d += ` C${n(p1.x + (p2.x - p0.x) / 6)} ${n(p1.y + (p2.y - p0.y) / 6)} ${n(p2.x - (p3.x - p1.x) / 6)} ${n(p2.y - (p3.y - p1.y) / 6)} ${n(p2.x)} ${n(p2.y)}`;
  }
  return d + ' Z';
}

/** Extra in-between points, so "where's the edge here?" has a close answer even for a 6-sided gem. */
function densify(p: Pt[], steps: number): Pt[] {
  const out: Pt[] = [];
  p.forEach((a, i) => {
    const b = p[(i + 1) % p.length];
    for (let s = 0; s < steps; s++) out.push({ x: a.x + ((b.x - a.x) * s) / steps, y: a.y + ((b.y - a.y) * s) / steps });
  });
  return out;
}

export function makeBody(shape: BodyShape, scale: number): Body {
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
