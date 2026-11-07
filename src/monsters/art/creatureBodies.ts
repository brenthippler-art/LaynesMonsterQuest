import { type Body, bodyFromPieces, CENTER_X, GROUND_Y, ovalPoints, type Pt, roundRectPoints, smoothPath } from './bodyKit';
import { n } from './pen';

/**
 * Animal bodies with a SEPARATE head (the face and top are drawn on the head,
 * see heads.ts). Each body is a few overlapping pieces joined into one shape:
 *
 *   dragon   round belly sitting on its haunches, short thick neck, head out front
 *   serpent  a coiled S of round segments, head raised
 *   beast    four legs and a deep chest (griffin, unicorn, lion, goat...)
 *   bird     upright, with a puffed-out chest
 *
 * All measurements are multiplied by `s` (the monster's size), around the
 * same stage as every other body: centered on CENTER_X, standing on GROUND_Y.
 */
export type CreatureShape = 'dragon' | 'serpent' | 'beast' | 'bird';

export function makeCreatureBody(shape: CreatureShape, s: number): Body {
  switch (shape) {
    case 'dragon':
      return dragon(s);
    case 'serpent':
      return serpent(s);
    case 'beast':
      return beast(s);
    case 'bird':
      return bird(s);
  }
}

/** Several closed pieces → one path (they all go clockwise, so overlaps join up). */
const join = (pieces: Pt[][]) => pieces.map(smoothPath).join(' ');

function dragon(s: number): Body {
  const rx = 46 * s;
  const ry = 42 * s;
  const cx = CENTER_X + 6 * s;
  const cy = GROUND_Y - ry;
  // A slightly pear-shaped trunk: wider at the bottom, like a dragon sitting down.
  const trunk = ovalPoints(cx, cy, rx, ry, 0, (t) => 0.88 + 0.14 * Math.sin(t));
  const haunch = ovalPoints(cx + 26 * s, GROUND_Y - 24 * s, 24 * s, 24 * s);
  const neck = ovalPoints(cx - 28 * s, cy - 38 * s, 17 * s, 30 * s, -28);
  return bodyFromPieces(join([trunk, haunch, neck]), [...trunk, ...haunch], { cx, cy, rx, ry }, {
    head: { x: cx - 40 * s, y: cy - 58 * s, scale: 0.74 * s, neck: { x: cx - 24 * s, y: cy - 30 * s } },
    feetX: [cx - 24 * s, cx + 30 * s],
  });
}

function serpent(s: number): Body {
  // The coil's middle line, from the tail end (right, on the ground) to just under the head.
  const S = (x: number, y: number, r: number) => ({ x: CENTER_X + x * s, y: GROUND_Y + y * s, r: r * s });
  const spine = [S(50, -16, 13), S(10, -14, 17), S(-34, -20, 18), S(-48, -42, 18), S(-26, -60, 17), S(16, -62, 16), S(30, -78, 15), S(14, -94, 14)];
  // Many overlapping circles along a smooth curve through the spine = one fat, smooth noodle.
  const circles: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < spine.length - 1; i++) {
    const p0 = spine[Math.max(0, i - 1)];
    const p1 = spine[i];
    const p2 = spine[i + 1];
    const p3 = spine[Math.min(spine.length - 1, i + 2)];
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      circles.push({ x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y), r: p1.r + (p2.r - p1.r) * t });
    }
  }
  circles.push(spine[spine.length - 1]);
  const d = circles
    .map(({ x, y, r }) => `M${n(x - r)} ${n(y)} A${n(r)} ${n(r)} 0 1 1 ${n(x + r)} ${n(y)} A${n(r)} ${n(r)} 0 1 1 ${n(x - r)} ${n(y)} Z`)
    .join(' ');
  // The outer edge: points on each circle that aren't inside another circle.
  const edge: Pt[] = [];
  for (const c of circles) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const q = { x: c.x + c.r * Math.cos(a), y: c.y + c.r * Math.sin(a) };
      if (!circles.some((o) => o !== c && Math.hypot(q.x - o.x, q.y - o.y) < o.r - 0.5)) edge.push(q);
    }
  }
  const xs = edge.map((q) => q.x);
  const ys = edge.map((q) => q.y);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const oval = { cx: (left + right) / 2, cy: (top + GROUND_Y) / 2, rx: (right - left) / 2, ry: (GROUND_Y - top) / 2 };
  const end = spine[spine.length - 1];
  return bodyFromPieces(d, edge, oval, {
    head: { x: end.x - 2 * s, y: end.y - 10 * s, scale: 0.72 * s, neck: { x: end.x, y: end.y } },
  });
}

function beast(s: number): Body {
  const rx = 56 * s;
  const ry = 26 * s;
  const legH = 26 * s;
  const cx = CENTER_X + 8 * s;
  const cy = GROUND_Y - legH - ry * 0.6;
  const trunk = ovalPoints(cx, cy, rx, ry);
  const chest = ovalPoints(cx - 30 * s, cy + 2 * s, 30 * s, 30 * s); // a deep chest at the front
  const legW = 16 * s;
  const legX = [cx - 42 * s, cx - 20 * s, cx + 22 * s, cx + 42 * s];
  const legs = legX.map((x) => roundRectPoints(x - legW / 2, cy, legW, GROUND_Y - cy, 7 * s));
  const neck = ovalPoints(cx - 40 * s, cy - 28 * s, 15 * s, 28 * s, -20);
  return bodyFromPieces(join([trunk, chest, ...legs, neck]), [...trunk, ...chest, ...legs.flat()], { cx, cy, rx, ry }, {
    head: { x: cx - 50 * s, y: cy - 50 * s, scale: 0.72 * s, neck: { x: cx - 36 * s, y: cy - 18 * s } },
    feetX: legX,
  });
}

function bird(s: number): Body {
  const rx = 38 * s;
  const ry = 46 * s;
  const legH = 10 * s;
  const cx = CENTER_X + 4 * s;
  const cy = GROUND_Y - legH - ry;
  const trunk = ovalPoints(cx, cy, rx, ry, 0, (t) => 0.9 + 0.12 * Math.sin(t)); // an egg shape
  const chest = ovalPoints(cx - 12 * s, cy + 8 * s, 34 * s, 34 * s); // the puffed-out chest
  const legX = [cx - 12 * s, cx + 12 * s];
  const legs = legX.map((x) => roundRectPoints(x - 4 * s, cy + ry - 6 * s, 8 * s, legH + 6 * s, 3 * s));
  return bodyFromPieces(join([trunk, chest, ...legs]), [...trunk, ...chest, ...legs.flat()], { cx, cy, rx, ry }, {
    head: { x: cx - 8 * s, y: cy - 54 * s, scale: 0.74 * s, neck: { x: cx - 6 * s, y: cy - 36 * s } },
    feetX: legX,
  });
}
