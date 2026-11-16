import { type Vector3 } from 'three';
import { type BodyShape } from '../../monsters/art/bodies';
import { type FeetStyle } from '../../monsters/art/limbs';
import { place, shade } from '../meshBuilder';
import { SHAPES } from '../shapes';
import { type Egg, type Frame, type Kit, skinPaint } from './kit';

/**
 * Monster bodies in 3D. Most are a ball, squeezed and bent into the body's
 * shape (a pear, a drop, a soft box...). The animal bodies (beast, dragon,
 * serpent, bird) get a separate head, and the living objects (bowl, appliance,
 * cart) are built like the thing they are.
 */

/** How high each kind of feet lifts the body off the ground. */
const LIFT: Record<FeetStyle, number> = {
  none: 0, stubs: 0.06, paws: 0.07, four: 0.18, flippers: 0.04, tentacles: 0.1, claws: 0.1, hooves: 0.22, wheels: 0.12,
};

const egg = (x: number, y: number, z: number, rx: number, ry: number, rz: number): Egg => ({ x, y, z, rx, ry, rz });

/** Ball bends, one per roundish shape. They move a corner of a ball (-1..1) to its new spot. */
const BENDS: Partial<Record<BodyShape, (p: Vector3) => void>> = {
  pear: (p) => {
    const k = 1.08 - 0.22 * p.y; // wide bottom, narrow top
    p.x *= k;
    p.z *= k;
  },
  square: (p) => {
    // Push the ball out toward a cube: a soft box.
    const m = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)) || 1;
    p.multiplyScalar(Math.pow(1 / m, 0.75));
  },
  drop: (p) => {
    if (p.y > 0) {
      const k = Math.pow(1 - p.y, 0.9); // pinched to a point on top
      p.x *= k;
      p.z *= k;
      p.y *= 1.35;
    }
  },
  cloud: (p) => {
    const k = 1 + 0.12 * Math.abs(Math.sin(Math.atan2(p.z, p.x) * 3)) * (1 - Math.abs(p.y) * 0.5);
    p.x *= k;
    p.z *= k;
  },
  blob: (p) => {
    if (p.y < 0) {
      p.x *= 1.15;
      p.z *= 1.15;
    }
    p.y *= 1 + 0.08 * Math.sin(p.x * 8) * Math.max(0, p.y);
  },
};

/** Half-sizes of the roundish bodies (medium size). */
const SIZE: Partial<Record<BodyShape, [number, number, number]>> = {
  round: [0.37, 0.35, 0.35],
  pear: [0.34, 0.39, 0.32],
  tall: [0.29, 0.47, 0.28],
  square: [0.34, 0.33, 0.31],
  long: [0.33, 0.29, 0.48],
  drop: [0.33, 0.33, 0.32],
  cloud: [0.39, 0.31, 0.36],
  spiky: [0.36, 0.34, 0.34],
  blob: [0.37, 0.3, 0.35],
  crystal: [0.3, 0.44, 0.3],
};

export function buildBody(k: Kit, feet: FeetStyle): Frame {
  const shape = k.look.body;
  const lift = LIFT[feet];
  switch (shape) {
    case 'beast': return beast(k, lift);
    case 'dragon': return dragon(k, lift);
    case 'serpent': return serpent(k);
    case 'bird': return bird(k, lift);
    case 'bowl': return bowl(k, lift);
    case 'appliance': return appliance(k, lift);
    case 'cart': return cart(k, lift);
    default: return roundish(k, shape, lift);
  }
}

function roundish(k: Kit, shape: BodyShape, lift: number): Frame {
  const [rx, ry, rz] = SIZE[shape] ?? SIZE.round!;
  const body = egg(0, lift + ry, 0, rx, ry, rz);
  const skin = skinPaint(k, false);
  if (shape === 'crystal') {
    k.b.add(SHAPES.diamond(), place(0, body.y, 0, rx, ry, rz, 0, Math.PI / 4), skin);
  } else {
    k.b.add(SHAPES.ball(12, 9), place(0, body.y, 0, rx, ry, rz), skin, BENDS[shape]);
  }
  if (shape === 'spiky') {
    // Spikes over the top half.
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const tip = 0.55;
      k.b.add(SHAPES.cone(4), place(Math.cos(a) * rx * 0.6, body.y + ry * 0.55, Math.sin(a) * rz * 0.6, 0.07, 0.22, 0.07, Math.sin(a) * tip, 0, -Math.cos(a) * tip), k.c.accent);
    }
    k.b.add(SHAPES.cone(4), place(0, body.y + ry * 0.85, 0, 0.07, 0.24, 0.07), k.c.accent);
  }
  // A long body is an animal on four legs, with its face at the front end.
  const head = shape === 'long' ? egg(0, body.y + ry * 0.25, rz * 0.45, rx * 0.8, ry * 0.75, rz * 0.6) : body;
  return { body, head, fourLegs: shape === 'long', lift, object: false };
}

function beast(k: Kit, lift: number): Frame {
  const body = egg(0, lift + 0.26, -0.05, 0.27, 0.24, 0.38);
  k.b.add(SHAPES.ball(12, 8), place(body.x, body.y, body.z, body.rx, body.ry, body.rz), skinPaint(k, false));
  const head = egg(0, body.y + 0.24, 0.36, 0.24, 0.22, 0.22);
  k.b.add(SHAPES.ball(10, 8), place(head.x, head.y, head.z, head.rx, head.ry, head.rz), skinPaint(k, false));
  return { body, head, fourLegs: true, lift, object: false };
}

function dragon(k: Kit, lift: number): Frame {
  const body = egg(0, lift + 0.3, -0.05, 0.3, 0.28, 0.36);
  const skin = skinPaint(k, false);
  k.b.add(SHAPES.ball(12, 8), place(body.x, body.y, body.z, body.rx, body.ry, body.rz), skin);
  // A neck leaning forward, then the head.
  k.b.add(SHAPES.taper(0.7, 7), place(0, body.y + 0.08, 0.2, 0.12, 0.32, 0.12, 0.6), k.c.main);
  const head = egg(0, body.y + 0.4, 0.38, 0.22, 0.2, 0.22);
  k.b.add(SHAPES.ball(10, 8), place(head.x, head.y, head.z, head.rx, head.ry, head.rz), skin);
  return { body, head, fourLegs: true, lift, object: false };
}

function serpent(k: Kit): Frame {
  // A wiggly chain of balls along the ground, getting smaller toward the tail.
  const skin = skinPaint(k, false);
  for (let i = 5; i >= 1; i--) {
    const r = 0.2 - i * 0.022;
    k.b.add(SHAPES.ball(9, 7), place(Math.sin(i * 1.3) * 0.16, r, -i * 0.15 + 0.05, r, r, r), skin);
  }
  const body = egg(0, 0.2, 0.08, 0.2, 0.2, 0.2);
  k.b.add(SHAPES.ball(10, 7), place(body.x, body.y, body.z, body.rx, body.ry, body.rz), skin);
  const head = egg(0, 0.5, 0.18, 0.22, 0.2, 0.2);
  k.b.add(SHAPES.taper(0.8, 7), place(0, 0.25, 0.12, 0.13, 0.25, 0.13, 0.25), k.c.main);
  k.b.add(SHAPES.ball(10, 8), place(head.x, head.y, head.z, head.rx, head.ry, head.rz), skin);
  return { body, head, fourLegs: false, lift: 0, object: false };
}

function bird(k: Kit, lift: number): Frame {
  const body = egg(0, lift + 0.3, -0.04, 0.29, 0.3, 0.3);
  k.b.add(SHAPES.ball(12, 8), place(body.x, body.y, body.z, body.rx, body.ry, body.rz), skinPaint(k, false));
  const head = egg(0, body.y + 0.32, 0.1, 0.2, 0.19, 0.19);
  k.b.add(SHAPES.ball(10, 8), place(head.x, head.y, head.z, head.rx, head.ry, head.rz), skinPaint(k, false));
  return { body, head, fourLegs: false, lift, object: false };
}

function bowl(k: Kit, lift: number): Frame {
  // A half ball, open side up, on a little foot, with the "inside" color on top.
  const y = lift + 0.42;
  k.b.add(SHAPES.taper(1.3, 8), place(0, lift, 0, 0.16, 0.06, 0.16), k.c.dark);
  k.b.add(SHAPES.dome(12), place(0, y, 0, 0.42, 0.38, 0.4, Math.PI), skinPaint(k, true));
  k.b.add(SHAPES.ring(0.12), place(0, y, 0, 0.42, 0.42, 0.4, Math.PI / 2), k.c.main);
  k.b.add(SHAPES.disc(12), place(0, y - 0.02, 0, 0.38, 1, 0.36), k.c.belly);
  const body = egg(0, y - 0.2, 0, 0.42, 0.22, 0.4);
  return { body, head: egg(0, y - 0.14, 0, 0.36, 0.2, 0.36), fourLegs: false, lift, object: true };
}

function appliance(k: Kit, lift: number): Frame {
  const body = egg(0, lift + 0.33, 0, 0.32, 0.33, 0.28);
  k.b.add(SHAPES.ball(12, 9), place(0, body.y, 0, body.rx, body.ry, body.rz), skinPaint(k, true), BENDS.square);
  // The screen on the front (the face goes on it) and two slots on top.
  k.b.add(SHAPES.box(), place(0, body.y + 0.02, body.rz - 0.01, 0.42, 0.34, 0.04), k.c.belly);
  for (const side of [-1, 1]) k.b.add(SHAPES.box(), place(side * 0.1, body.y + body.ry + 0.005, 0, 0.08, 0.02, 0.32), shade(k.c.main, -0.5));
  const head = egg(0, body.y + 0.02, body.rz - 0.18, 0.2, 0.17, 0.2);
  return { body, head, fourLegs: false, lift, object: true };
}

function cart(k: Kit, lift: number): Frame {
  // A basket, wider at the top, made of bars, with a push handle at the back.
  const y = lift + 0.08;
  const bars = (p: Vector3) => (Math.floor((p.x + 1) * 4) + Math.floor(p.y * 4)) % 2 ? k.c.main : shade(k.c.main, -0.25);
  k.b.add(SHAPES.taper(1.25, 4, 3), place(0, y, 0, 0.32, 0.45, 0.4, 0, Math.PI / 4), bars);
  k.b.add(SHAPES.box(), place(0, y + 0.47, -0.38, 0.5, 0.04, 0.04), k.c.accent);
  for (const side of [-1, 1]) k.b.add(SHAPES.box(), place(side * 0.24, y + 0.38, -0.34, 0.03, 0.2, 0.03), k.c.accent);
  const body = egg(0, y + 0.22, 0, 0.36, 0.22, 0.4);
  return { body, head: egg(0, y + 0.24, 0.12, 0.28, 0.2, 0.3), fourLegs: false, lift, object: true };
}
