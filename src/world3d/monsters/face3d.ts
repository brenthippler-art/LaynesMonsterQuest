import { place } from '../meshBuilder';
import { SHAPES } from '../shapes';
import { type Egg, type Kit, onFront, topOf } from './kit';

/**
 * Faces: eyes, mouth and blush, stuck onto the front of the head. Friendly
 * shapes only (round eyes, smiles, rounded teeth), like the pixel pictures.
 */
const EYE_UP = 0.18; // eyes sit a little above the middle of the face
const MOUTH_DOWN = -0.32;

export function addFace(k: Kit, head: Egg, extra = false): void {
  addEyes(k, head);
  addMouth(k, head);
  if (k.look.cheeks && !extra) {
    for (const side of [-1, 1]) {
      const p = onFront(head, side * 0.55, -0.12, -0.005);
      k.b.add(SHAPES.gem(0), place(p.x, p.y, p.z, head.rx * 0.13, head.ry * 0.08, 0.02, 0, side * 0.5), k.c.blush);
    }
  }
}

function addEyes(k: Kit, head: Egg): void {
  const { b, c } = k;
  const r = Math.min(head.rx, head.ry); // eyes are sized to the head
  const spread = 0.38;
  const style = k.look.eyes;

  if (style === 'cyclops') {
    const p = onFront(head, 0, EYE_UP + 0.05, 0);
    b.add(SHAPES.ball(10, 7), place(p.x, p.y, p.z - 0.03, r * 0.36, r * 0.36, r * 0.16), c.white);
    b.add(SHAPES.ball(8, 6), place(p.x, p.y, p.z + r * 0.1, r * 0.2, r * 0.2, r * 0.08), c.eye);
    b.add(SHAPES.ball(6, 4), place(p.x, p.y, p.z + r * 0.15, r * 0.1, r * 0.1, r * 0.05), c.ink);
    b.add(SHAPES.gem(0), place(p.x + r * 0.07, p.y + r * 0.08, p.z + r * 0.19, r * 0.05), c.white);
    return;
  }
  if (style === 'stalks') {
    for (const side of [-1, 1]) {
      const x = head.x + side * head.rx * 0.35;
      const y = topOf(head) - head.ry * 0.15;
      b.add(SHAPES.tube(5), place(x, y, head.z + head.rz * 0.2, r * 0.07, r * 0.75, r * 0.07, 0, 0, -side * 0.25), c.main);
      const ex = x + side * r * 0.18;
      const ey = y + r * 0.75;
      b.add(SHAPES.ball(8, 6), place(ex, ey, head.z + head.rz * 0.25, r * 0.2), c.white);
      b.add(SHAPES.ball(6, 4), place(ex, ey, head.z + head.rz * 0.25 + r * 0.16, r * 0.09, r * 0.11, r * 0.06), c.ink);
    }
    return;
  }
  for (const side of [-1, 1]) {
    const p = onFront(head, side * spread, EYE_UP, 0);
    switch (style) {
      case 'dot':
        b.add(SHAPES.ball(6, 5), place(p.x, p.y, p.z, r * 0.08, r * 0.12, r * 0.06), c.ink);
        break;
      case 'round':
        b.add(SHAPES.ball(8, 6), place(p.x, p.y, p.z - 0.01, r * 0.17, r * 0.19, r * 0.08), c.white);
        b.add(SHAPES.ball(6, 5), place(p.x + side * r * 0.02, p.y - r * 0.02, p.z + r * 0.05, r * 0.08, r * 0.1, r * 0.05), c.ink);
        b.add(SHAPES.gem(0), place(p.x + r * 0.03, p.y + r * 0.04, p.z + r * 0.09, r * 0.03), c.white);
        break;
      case 'big':
        b.add(SHAPES.ball(8, 6), place(p.x, p.y, p.z - 0.01, r * 0.24, r * 0.26, r * 0.1), c.white);
        b.add(SHAPES.ball(8, 6), place(p.x, p.y - r * 0.03, p.z + r * 0.06, r * 0.16, r * 0.18, r * 0.06), c.eye);
        b.add(SHAPES.ball(6, 5), place(p.x, p.y - r * 0.03, p.z + r * 0.1, r * 0.08, r * 0.1, r * 0.04), c.ink);
        b.add(SHAPES.gem(0), place(p.x + r * 0.06, p.y + r * 0.07, p.z + r * 0.13, r * 0.05), c.white);
        break;
      case 'happy':
        // ^ ^ : two little bars leaning together.
        for (const lean of [-1, 1]) {
          b.add(SHAPES.box(), place(p.x + lean * r * 0.05, p.y, p.z, r * 0.13, r * 0.035, r * 0.04, 0, 0, -lean * 0.7), c.ink);
        }
        break;
      case 'sleepy':
        b.add(SHAPES.ball(8, 6), place(p.x, p.y, p.z - 0.01, r * 0.16, r * 0.15, r * 0.07), c.white);
        b.add(SHAPES.ball(6, 5), place(p.x, p.y - r * 0.04, p.z + r * 0.04, r * 0.07, r * 0.07, r * 0.04), c.ink);
        // A sleepy lid over the top half.
        b.add(SHAPES.dome(8), place(p.x, p.y - r * 0.01, p.z + 0.002, r * 0.18, r * 0.13, r * 0.09), c.dark);
        break;
    }
  }
}

function addMouth(k: Kit, head: Egg): void {
  const { b, c } = k;
  const r = Math.min(head.rx, head.ry);
  const p = onFront(head, 0, MOUTH_DOWN, 0);
  switch (k.look.mouth) {
    case 'smile':
      b.add(SHAPES.ring(0.3, Math.PI), place(p.x, p.y + r * 0.06, p.z, r * 0.16, r * 0.13, r * 0.06, 0, 0, Math.PI), c.ink);
      break;
    case 'grin':
      b.add(SHAPES.dome(8), place(p.x, p.y + r * 0.04, p.z - 0.005, r * 0.24, r * 0.17, r * 0.06, 0, 0, Math.PI), c.mouth);
      b.add(SHAPES.box(), place(p.x, p.y + r * 0.02, p.z + r * 0.02, r * 0.36, r * 0.05, r * 0.03), c.white);
      break;
    case 'open':
      b.add(SHAPES.ball(8, 6), place(p.x, p.y, p.z, r * 0.15, r * 0.12, r * 0.05), c.mouth);
      b.add(SHAPES.ball(6, 4), place(p.x, p.y - r * 0.05, p.z + r * 0.02, r * 0.09, r * 0.05, r * 0.04), c.tongue);
      break;
    case 'fang':
      b.add(SHAPES.ring(0.3, Math.PI), place(p.x, p.y + r * 0.06, p.z, r * 0.16, r * 0.13, r * 0.06, 0, 0, Math.PI), c.ink);
      for (const side of [-1, 1]) {
        // Little rounded teeth, pointing down.
        b.add(SHAPES.cone(4), place(p.x + side * r * 0.09, p.y - r * 0.02, p.z + r * 0.03, r * 0.035, r * 0.08, r * 0.035, Math.PI), c.white);
      }
      break;
    case 'beak':
      b.add(SHAPES.cone(5), place(p.x, p.y + r * 0.08, p.z - 0.02, r * 0.14, r * 0.3, r * 0.1, Math.PI / 2), c.beak);
      break;
    case 'cat':
      for (const side of [-1, 1]) {
        b.add(SHAPES.ring(0.3, Math.PI), place(p.x + side * r * 0.07, p.y + r * 0.05, p.z, r * 0.07, r * 0.07, r * 0.05, 0, 0, Math.PI), c.ink);
      }
      b.add(SHAPES.gem(0), place(p.x, p.y + r * 0.13, p.z + r * 0.02, r * 0.05, r * 0.035, r * 0.04), c.mouth);
      break;
    case 'o':
      b.add(SHAPES.ring(0.45), place(p.x, p.y, p.z, r * 0.06, r * 0.07, r * 0.06), c.ink);
      break;
    case 'snout': {
      const s = onFront(head, 0, -0.18, 0);
      b.add(SHAPES.ball(9, 6), place(s.x, s.y, s.z - 0.02, r * 0.3, r * 0.2, r * 0.2), k.c.belly);
      for (const side of [-1, 1]) b.add(SHAPES.gem(0), place(s.x + side * r * 0.1, s.y + r * 0.04, s.z + r * 0.17, r * 0.035), c.dark);
      b.add(SHAPES.ring(0.3, Math.PI), place(s.x, s.y - r * 0.06, s.z + r * 0.15, r * 0.12, r * 0.08, r * 0.05, 0, 0, Math.PI), c.ink);
      break;
    }
  }
}
