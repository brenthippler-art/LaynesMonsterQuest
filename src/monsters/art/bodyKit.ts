import { type Palette } from '../monsterTypes';
import { type Face } from './face';
import { n, type Pen } from './pen';

/**
 * Shared pieces for building body shapes: the Body interface every part
 * attaches to, the stage size, and helpers that turn points into smooth paths.
 * (bodies.ts has the original round-ish bodies; creatureBodies.ts and
 * objectBodies.ts have the newer ones.)
 */
export interface Pt {
  x: number;
  y: number;
}

/** Where a separate head sits (dragons, serpents, beasts, birds). */
export interface HeadSpot {
  /** Middle of the head. */
  x: number;
  y: number;
  /** Head size compared with a plain round body (0.5 = half as big). */
  scale: number;
  /** Where the neck meets the body (extra heads grow their necks from here). */
  neck: Pt;
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
  /** Bodies with a separate head: where it goes. The face and top are drawn on it. */
  head?: HeadSpot;
  /** Bodies with legs built in: the x of each leg (feet are drawn under these). */
  feetX?: number[];
  /** Bodies whose face isn't in the usual place (a toilet's face sits below its rim). */
  face?: Face;
  /** Extra pieces drawn on top of the body (a screen, a rim, cart wires). */
  details?: (pen: Pen, c: Palette) => string;
}

/** Everything stands on this line; the picture is 250 wide x 210 tall. */
export const CENTER_X = 100;
export const GROUND_Y = 166;
export const BASE_RX = 54;
export const BASE_RY = 48;
export const TAU = Math.PI * 2;

/** N points around a shape, starting at the top and going clockwise. */
export function ring(count: number, at: (t: number) => Pt): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) out.push(at(-Math.PI / 2 + (i / count) * TAU));
  return out;
}

/** Straight lines between points (spikes, gems). */
export function sharpPath(p: Pt[]): string {
  return p.map((q, i) => `${i ? 'L' : 'M'}${n(q.x)} ${n(q.y)}`).join(' ') + ' Z';
}

/** A smooth curve through all the points (Catmull-Rom turned into Bézier curves). */
export function smoothPath(p: Pt[]): string {
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
export function densify(p: Pt[], steps: number): Pt[] {
  const out: Pt[] = [];
  p.forEach((a, i) => {
    const b = p[(i + 1) % p.length];
    for (let s = 0; s < steps; s++) out.push({ x: a.x + ((b.x - a.x) * s) / steps, y: a.y + ((b.y - a.y) * s) / steps });
  });
  return out;
}

// ---------- Helpers for the newer bodies, which are built from several overlapping pieces ----------
// Every piece goes clockwise, so where pieces overlap they simply join into one shape.

/** Points around an oval, optionally turned by `angle` degrees and bent by `bend` (k = 1 is a plain oval). */
export function ovalPoints(cx: number, cy: number, rx: number, ry: number, angle = 0, bend?: (t: number) => number): Pt[] {
  const a = (angle * Math.PI) / 180;
  return ring(40, (t) => {
    const k = bend ? bend(t) : 1;
    const x = rx * Math.cos(t) * k;
    const y = ry * Math.sin(t);
    return { x: cx + x * Math.cos(a) - y * Math.sin(a), y: cy + x * Math.sin(a) + y * Math.cos(a) };
  });
}

/** A rounded rectangle as points (clockwise), so it can be both drawn and measured. */
export function roundRectPoints(x: number, y: number, w: number, h: number, r: number): Pt[] {
  const out: Pt[] = [];
  const corners: [number, number, number][] = [
    [x + w - r, y + r, -90],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, 90],
    [x + r, y + r, 180],
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= 6; i++) {
      const a = ((start + i * 15) * Math.PI) / 180;
      out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
  }
  return out;
}

/**
 * Turn the outline points of a newer body into a Body. Edge questions ("how high is the
 * top at this x?") are answered from `edge`, which is usually just the main trunk, so arms,
 * tails and feet attach to the trunk and not to the neck.
 */
export function bodyFromPieces(
  d: string,
  edge: Pt[],
  oval: { cx: number; cy: number; rx: number; ry: number },
  extra: Partial<Pick<Body, 'head' | 'feetX' | 'face' | 'details'>> = {},
): Body {
  const xs = edge.map((q) => q.x);
  const ys = edge.map((q) => q.y);
  const near = (a: number, b: number) => Math.abs(a - b) <= 4;
  return {
    d,
    ...oval,
    top: Math.min(...ys),
    bottom: Math.max(...ys),
    left: Math.min(...xs),
    right: Math.max(...xs),
    topYAt(x) {
      const above = edge.filter((q) => near(q.x, x));
      if (above.length) return Math.min(...above.map((q) => q.y));
      return edge.reduce((best, q) => (Math.abs(q.x - x) < Math.abs(best.x - x) ? q : best)).y;
    },
    sideXAt(y, side) {
      const level = edge.filter((q) => near(q.y, y));
      if (level.length) return side > 0 ? Math.max(...level.map((q) => q.x)) : Math.min(...level.map((q) => q.x));
      return side > 0 ? Math.max(...xs) : Math.min(...xs);
    },
    ...extra,
  };
}
