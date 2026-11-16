import { type ArmStyle, type FeetStyle, type TailStyle } from '../../monsters/art/limbs';
import { NES } from '../../render/nesPalette';
import { place, rgb, shade } from '../meshBuilder';
import { SHAPES } from '../shapes';
import { type Frame, type Kit } from './kit';

/** Feet, arms (and wings) and tails. */
const SIDES = [-1, 1] as const;
const FLAME_IN = rgb(NES.gold);
const FLAME_OUT = rgb(NES.orange);
const TIRE = rgb('#303030');
const HUB = rgb(NES.grayLight);

export function addFeet(k: Kit, f: Frame, feet: FeetStyle): void {
  const { b, c } = k;
  const { body, lift } = f;
  // Where the feet go: two in front, or four under a long body.
  const spots: [number, number][] = f.fourLegs
    ? [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => [sx * body.rx * 0.55, body.z + sz * body.rz * 0.55])
    : SIDES.map((s) => [s * body.rx * 0.45, body.z + body.rz * 0.25]);
  for (const [x, z] of spots) {
    switch (feet) {
      case 'none':
        return;
      case 'stubs':
        b.add(SHAPES.ball(7, 5), place(x, 0.06, z + 0.03, 0.1, 0.07, 0.12), c.feet);
        break;
      case 'paws':
        b.add(SHAPES.ball(7, 5), place(x, 0.06, z + 0.04, 0.11, 0.07, 0.13), c.feet);
        for (const t of [-1, 0, 1]) b.add(SHAPES.gem(0), place(x + t * 0.04, 0.04, z + 0.16, 0.025), c.belly);
        break;
      case 'four':
      case 'hooves':
        b.add(SHAPES.tube(5), place(x, 0, z, 0.07, lift + 0.08, 0.07), c.feet);
        if (feet === 'hooves') b.add(SHAPES.tube(5), place(x, 0, z, 0.08, 0.07, 0.08), c.dark);
        break;
      case 'claws':
        b.add(SHAPES.tube(5), place(x, 0.04, z, 0.07, lift, 0.07), c.feet);
        for (const t of [-1, 0, 1]) b.add(SHAPES.cone(3), place(x + t * 0.04, 0.03, z + 0.07, 0.025, 0.08, 0.025, Math.PI / 2), c.white);
        break;
      case 'flippers':
        b.add(SHAPES.ball(6, 4), place(x * 1.2, 0.03, z + 0.05, 0.13, 0.03, 0.17, 0, x > 0 ? -0.4 : 0.4), c.feet);
        break;
      case 'tentacles':
        // Wiggly legs all around the bottom.
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          b.add(SHAPES.taper(0.4, 5), place(Math.cos(a) * body.rx * 0.6, 0, body.z + Math.sin(a) * body.rz * 0.6, 0.06, lift + 0.06, 0.06, Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5), c.accent);
        }
        return;
      case 'wheels':
        b.add(SHAPES.tube(8), place(x * 1.15, 0.11, z, 0.11, 0.08, 0.11, 0, 0, Math.PI / 2), TIRE);
        b.add(SHAPES.tube(6), place(x * 1.15 + Math.sign(x) * 0.005, 0.11, z, 0.05, 0.085, 0.05, 0, 0, Math.PI / 2), HUB);
        break;
    }
  }
}

export function addArms(k: Kit, f: Frame, arms: ArmStyle): void {
  const { b, c } = k;
  const { body } = f;
  const y = body.y + body.ry * 0.05;
  for (const s of SIDES) {
    const x = s * body.rx * 0.95;
    switch (arms) {
      case 'none':
        return;
      case 'nubs':
        b.add(SHAPES.ball(7, 5), place(x, y - 0.04, body.z + body.rz * 0.2, 0.08, 0.12, 0.08, 0, 0, s * 0.6), c.main);
        break;
      case 'leaves':
        b.add(SHAPES.ball(6, 5), place(x + s * 0.08, y, body.z, 0.16, 0.05, 0.09, 0, 0, s * 0.3), c.accent);
        break;
      case 'flippers':
        b.add(SHAPES.ball(6, 5), place(x + s * 0.06, y - 0.08, body.z + 0.05, 0.16, 0.04, 0.1, 0, 0, s * 0.7), c.accent);
        break;
      case 'claws':
      case 'pincers':
        b.add(SHAPES.tube(5), place(x, y - 0.05, body.z + body.rz * 0.4, 0.04, 0.18, 0.04, 1.2, 0, -s * 0.3), c.main);
        if (arms === 'pincers') {
          for (const t of [-1, 1]) b.add(SHAPES.cone(4), place(x + s * 0.05 + t * 0.03, y - 0.02, body.z + body.rz * 0.4 + 0.18, 0.05, 0.14, 0.04, Math.PI / 2, 0, t * 0.3), c.accent);
        } else {
          b.add(SHAPES.ball(6, 5), place(x + s * 0.05, y - 0.02, body.z + body.rz * 0.4 + 0.17, 0.07), c.main);
        }
        break;
      case 'insect':
        // Thin little legs out to the side, two per side.
        for (const dz of [-0.08, 0.08]) b.add(SHAPES.tube(3), place(x, y - 0.06, body.z + dz, 0.02, 0.2, 0.02, 0, 0, s * 2.0), c.dark);
        break;
      case 'wings':
      case 'bird':
      case 'feathers':
        // Folded-out wings: a flat egg shape on each side, angled up and back.
        b.add(SHAPES.ball(7, 5), place(x + s * 0.14, y + 0.06, body.z - 0.06, 0.24, 0.05, 0.15, 0, s * 0.3, s * 0.5), c.wing);
        if (arms === 'feathers') {
          for (const t of [0, 1, 2]) b.add(SHAPES.cone(3), place(x + s * (0.3 + t * 0.04), y + 0.12 + t * 0.05, body.z - 0.12 - t * 0.05, 0.04, 0.2, 0.02, -0.5, 0, -s * (1.0 - t * 0.2)), shade(c.wing, 0.2));
        }
        break;
      case 'dragonwings':
        // Big bat-like wings: a frame bar and a stretched skin, up behind the shoulders.
        b.add(SHAPES.cone(3), place(x, y + 0.12, body.z - 0.1, 0.32, 0.5, 0.03, -0.3, s * 0.2, -s * 0.9), c.wing);
        b.add(SHAPES.tube(4), place(x, y + 0.1, body.z - 0.12, 0.025, 0.45, 0.025, -0.3, 0, -s * 0.9), c.dark);
        break;
    }
  }
}

export function addTail(k: Kit, f: Frame, tail: TailStyle): void {
  const { b, c } = k;
  const { body } = f;
  const x = 0;
  const y = body.y - body.ry * 0.25;
  const z = body.z - body.rz * 0.95;
  switch (tail) {
    case 'none':
      return;
    case 'puff':
      b.add(SHAPES.gem(1), place(x, y, z - 0.03, 0.11), c.belly);
      return;
    case 'fluffy':
      b.add(SHAPES.gem(1), place(x, y + 0.1, z - 0.1, 0.15, 0.2, 0.13, 0.6), c.accent);
      return;
    case 'curl':
      b.add(SHAPES.ring(0.35), place(x, y + 0.1, z - 0.1, 0.1, 0.1, 0.1, 0, Math.PI / 2), c.main);
      return;
    case 'leaf':
      b.add(SHAPES.ball(6, 5), place(x, y + 0.1, z - 0.12, 0.06, 0.18, 0.12, -0.6), c.accent);
      return;
    case 'flame':
      b.add(SHAPES.cone(6, 2), place(x, y, z - 0.05, 0.1, 0.32, 0.1, -0.9), (p) => (p.y < 0.4 ? FLAME_IN : FLAME_OUT));
      return;
    case 'fish':
      b.add(SHAPES.cone(3), place(x, y + 0.05, z - 0.15, 0.17, 0.2, 0.03, -Math.PI / 2, 0, Math.PI / 2), c.accent);
      return;
    case 'zigzag':
      for (let i = 0; i < 3; i++) {
        b.add(SHAPES.box(), place(x, y + 0.06 + i * 0.07, z - 0.06 - i * 0.06, 0.04, 0.12, 0.04, (i % 2 ? 0.8 : -0.8) - 0.6), c.accent);
      }
      return;
    case 'long':
      b.add(SHAPES.taper(0.4, 5), place(x, y, z + 0.03, 0.05, 0.4, 0.05, -1.1), c.main);
      b.add(SHAPES.gem(0), place(x, y + 0.17, z - 0.33, 0.06), c.accent);
      return;
    case 'spiky':
      b.add(SHAPES.taper(0.3, 5), place(x, y, z + 0.03, 0.07, 0.35, 0.07, -1.2), c.main);
      for (let i = 0; i < 3; i++) b.add(SHAPES.cone(4), place(x, y + 0.08 + i * 0.03, z - 0.06 - i * 0.1, 0.04, 0.1, 0.04), c.accent);
      return;
    case 'dragon':
      b.add(SHAPES.taper(0.25, 6), place(x, y - 0.05, z + 0.04, 0.1, 0.55, 0.1, -1.35), c.main);
      b.add(SHAPES.diamond(), place(x, y + 0.04, z - 0.52, 0.03, 0.08, 0.1), c.accent);
      return;
    case 'serpent':
      b.add(SHAPES.taper(0.2, 6), place(x, 0.08, z + 0.05, 0.1, 0.4, 0.1, -1.5), c.main);
      return;
    case 'plume':
      for (const t of [-1, 0, 1]) b.add(SHAPES.ball(6, 5), place(x + t * 0.06, y + 0.2, z - 0.12, 0.05, 0.24, 0.05, -0.5, 0, t * 0.4), t ? c.accent : c.wing);
      return;
  }
}
