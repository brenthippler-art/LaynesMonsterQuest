import { type Palette } from '../monsterTypes';
import { type Body, bodyFromPieces, CENTER_X, GROUND_Y, ovalPoints, type Pt, roundRectPoints, sharpPath, smoothPath } from './bodyKit';
import { ellipse, n, type Pen, region, shape, tube } from './pen';

/**
 * "Living object" bodies. The face goes straight on the object (no separate head):
 *
 *   bowl       a wide rim on top, narrowing to a little foot. Add the 'lid' top for a toilet, cup or pot.
 *   appliance  a soft box with a rounded screen on the front (the face goes on it) and slots on top
 *   cart       a wire basket (wider at the top) with a push handle. Add 'wheels' feet.
 */
export type ObjectShape = 'bowl' | 'appliance' | 'cart';

const SLOT = '#503000';
const FLAT = { outline: false, shade: false };

export function makeObjectBody(shape: ObjectShape, s: number): Body {
  switch (shape) {
    case 'bowl':
      return bowl(s);
    case 'appliance':
      return appliance(s);
    case 'cart':
      return cart(s);
  }
}

function bowl(s: number): Body {
  const cx = CENTER_X;
  const top = GROUND_Y - 92 * s;
  const rimY = top + 12 * s;
  const y0 = rimY + 4 * s; // where the bowl starts under the rim
  const baseY = GROUND_Y - 14 * s;
  // The bowl, clockwise: across the top, down the right side, along the bottom, up the left side.
  const bowlPath =
    `M${n(cx - 54 * s)} ${n(y0)} L${n(cx + 54 * s)} ${n(y0)}` +
    ` C${n(cx + 54 * s)} ${n(y0 + 46 * s)} ${n(cx + 30 * s)} ${n(baseY - 6 * s)} ${n(cx + 26 * s)} ${n(baseY)}` +
    ` L${n(cx - 26 * s)} ${n(baseY)} C${n(cx - 30 * s)} ${n(baseY - 6 * s)} ${n(cx - 54 * s)} ${n(y0 + 46 * s)} ${n(cx - 54 * s)} ${n(y0)} Z`;
  const rim = ovalPoints(cx, rimY, 60 * s, 14 * s);
  const foot = roundRectPoints(cx - 32 * s, baseY - 4 * s, 64 * s, GROUND_Y - baseY + 4 * s, 6 * s);
  // For measuring: the rim, the bowl's sides (as points) and the foot.
  const sides: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const half = 54 * s - (54 - 26) * s * t * t;
    const y = y0 + (baseY - y0) * t;
    sides.push({ x: cx - half, y }, { x: cx + half, y });
  }
  const d = [smoothPath(rim), bowlPath, smoothPath(foot)].join(' ');
  const eyeY = y0 + 24 * s;
  return bodyFromPieces(d, [...rim, ...sides, ...foot], { cx, cy: (top + GROUND_Y) / 2, rx: 60 * s, ry: (GROUND_Y - top) / 2 }, {
    face: { eyeY, eyeDX: 20 * s, mouthY: eyeY + 22 * s },
    feetX: [cx - 22 * s, cx + 22 * s],
    // The rim again, in front, so a line shows where it meets the bowl, plus the dark opening on top.
    details: (pen: Pen, c: Palette) =>
      shape(pen, smoothPath(rim), c.main) + ellipse(pen, cx, rimY - 2 * s, 46 * s, 7 * s, c.belly, 0, { shade: false }),
  });
}

function appliance(s: number): Body {
  const w = 100 * s;
  const h = 96 * s;
  const x = CENTER_X - w / 2;
  const y = GROUND_Y - h;
  const box = roundRectPoints(x, y, w, h, 16 * s);
  const screen = { x: CENTER_X - 36 * s, y: y + 16 * s, w: 72 * s, h: 52 * s };
  const eyeY = screen.y + 20 * s;
  return bodyFromPieces(smoothPath(box), box, { cx: CENTER_X, cy: y + h / 2, rx: w / 2, ry: h / 2 }, {
    face: { eyeY, eyeDX: 18 * s, mouthY: eyeY + 18 * s },
    details: (pen: Pen, c: Palette) =>
      // Two slots on top (a toaster!), the screen the face sits on, and two buttons.
      shape(pen, smoothPath(roundRectPoints(CENTER_X - 32 * s, y + 4 * s, 24 * s, 7 * s, 3 * s)), SLOT, FLAT) +
      shape(pen, smoothPath(roundRectPoints(CENTER_X + 8 * s, y + 4 * s, 24 * s, 7 * s, 3 * s)), SLOT, FLAT) +
      shape(pen, smoothPath(roundRectPoints(screen.x, screen.y, screen.w, screen.h, 12 * s)), c.belly) +
      ellipse(pen, CENTER_X - 16 * s, y + h - 16 * s, 7 * s, 7 * s, c.accent) +
      ellipse(pen, CENTER_X + 16 * s, y + h - 16 * s, 7 * s, 7 * s, c.accent),
  });
}

function cart(s: number): Body {
  const topY = GROUND_Y - 84 * s;
  const botY = GROUND_Y - 6 * s;
  const tw = 58 * s; // half-width at the top
  const bw = 44 * s; // half-width at the bottom
  const basket: Pt[] = [
    { x: CENTER_X - tw, y: topY },
    { x: CENTER_X + tw, y: topY },
    { x: CENTER_X + bw, y: botY },
    { x: CENTER_X - bw, y: botY },
  ];
  const eyeY = topY + 30 * s;
  // Measuring points along the basket's sides.
  const edge: Pt[] = [];
  basket.forEach((a, i) => {
    const b = basket[(i + 1) % basket.length];
    for (let k = 0; k < 10; k++) edge.push({ x: a.x + ((b.x - a.x) * k) / 10, y: a.y + ((b.y - a.y) * k) / 10 });
  });
  return bodyFromPieces(sharpPath(basket), edge, { cx: CENTER_X, cy: (topY + botY) / 2, rx: (tw + bw) / 2, ry: (botY - topY) / 2 }, {
    face: { eyeY, eyeDX: 20 * s, mouthY: eyeY + 20 * s },
    feetX: [CENTER_X - 32 * s, CENTER_X + 32 * s],
    details: (pen: Pen, c: Palette) => {
      // Wires: flat lighter lines (they disappear on coloring pages, so those stay clean),
      // kept to the sides so the face has room. Then the top rail and the push handle.
      const wire = region(pen, c.belly, FLAT);
      const lines: string[] = [];
      for (const k of [-0.82, -0.6, 0.6, 0.82]) lines.push(`M${n(CENTER_X + k * tw)} ${n(topY)} L${n(CENTER_X + k * bw)} ${n(botY)}`);
      const lowY = botY - 18 * s;
      const lowHalf = bw + (tw - bw) * (18 / 78);
      lines.push(`M${n(CENTER_X - lowHalf)} ${n(lowY)} L${n(CENTER_X + lowHalf)} ${n(lowY)}`);
      const wires = `<path d="${lines.join(' ')}" fill="none" stroke="${wire}" stroke-width="${n(5 * s)}" stroke-linecap="round"/>`;
      const rail = shape(pen, smoothPath(roundRectPoints(CENTER_X - tw - 4 * s, topY - 4 * s, 2 * tw + 8 * s, 10 * s, 5 * s)), c.accent);
      const handle = tube(pen, `M${n(CENTER_X + tw)} ${n(topY + 2 * s)} L${n(CENTER_X + tw + 14 * s)} ${n(topY - 16 * s)} L${n(CENTER_X + tw + 26 * s)} ${n(topY - 16 * s)}`, 8 * s, c.accent);
      return wires + handle + rail;
    },
  });
}
