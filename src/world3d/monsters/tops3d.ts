import { type TopStyle } from '../../monsters/art/tops';
import { NES } from '../../render/nesPalette';
import { place, rgb, shade } from '../meshBuilder';
import { SHAPES } from '../shapes';
import { type Egg, type Kit, topOf } from './kit';

/** What's on top of the head: ears, horns, leaves, hats... */
const SIDES = [-1, 1] as const;
const GOLD = rgb(NES.gold);
const RED = rgb(NES.redBright);
const FLAME_IN = rgb(NES.gold);
const FLAME_OUT = rgb(NES.orange);

export function addTop(k: Kit, head: Egg, top: TopStyle): void {
  const { b, c } = k;
  const y = topOf(head);
  const r = Math.min(head.rx, head.ry);
  const { x, z } = head;
  switch (top) {
    case 'none':
      return;
    case 'cat':
      for (const s of SIDES) b.add(SHAPES.cone(4), place(x + s * head.rx * 0.55, y - r * 0.3, z, r * 0.24, r * 0.55, r * 0.14, 0, 0, -s * 0.35), c.main);
      for (const s of SIDES) b.add(SHAPES.cone(4), place(x + s * head.rx * 0.55, y - r * 0.22, z + r * 0.07, r * 0.13, r * 0.35, r * 0.06, 0, 0, -s * 0.35), c.accent);
      return;
    case 'bunny':
      for (const s of SIDES) {
        b.add(SHAPES.ball(7, 6), place(x + s * head.rx * 0.32, y + r * 0.45, z - r * 0.05, r * 0.15, r * 0.6, r * 0.1, 0, 0, -s * 0.2), c.main);
        b.add(SHAPES.ball(6, 5), place(x + s * head.rx * 0.32, y + r * 0.45, z + r * 0.05, r * 0.08, r * 0.45, r * 0.04, 0, 0, -s * 0.2), c.accent);
      }
      return;
    case 'round':
      for (const s of SIDES) {
        b.add(SHAPES.ball(8, 6), place(x + s * head.rx * 0.62, y - r * 0.12, z, r * 0.27, r * 0.27, r * 0.1), c.main);
        b.add(SHAPES.ball(6, 5), place(x + s * head.rx * 0.62, y - r * 0.12, z + r * 0.06, r * 0.15, r * 0.15, r * 0.06), c.accent);
      }
      return;
    case 'horns':
      for (const s of SIDES) b.add(SHAPES.cone(6), place(x + s * head.rx * 0.45, y - r * 0.2, z, r * 0.14, r * 0.45, r * 0.14, 0, 0, -s * 0.5), c.accent);
      return;
    case 'antennae':
      for (const s of SIDES) {
        b.add(SHAPES.tube(4), place(x + s * head.rx * 0.28, y - r * 0.1, z, r * 0.03, r * 0.6, r * 0.03, 0, 0, -s * 0.3), c.dark);
        b.add(SHAPES.ball(6, 5), place(x + s * (head.rx * 0.28 + r * 0.18), y + r * 0.48, z, r * 0.1), c.accent);
      }
      return;
    case 'leaf':
      b.add(SHAPES.tube(4), place(x, y - r * 0.1, z, r * 0.03, r * 0.3, r * 0.03), rgb(NES.green));
      for (const s of SIDES) b.add(SHAPES.ball(6, 5), place(x + s * r * 0.17, y + r * 0.22, z, r * 0.2, r * 0.07, r * 0.11, 0, 0, s * 0.4), c.accent);
      return;
    case 'flame':
      b.add(SHAPES.cone(6, 2), place(x, y - r * 0.2, z, r * 0.3, r * 0.75, r * 0.3), (p) => (p.y < 0.4 ? FLAME_IN : FLAME_OUT));
      b.add(SHAPES.cone(5), place(x + r * 0.2, y - r * 0.2, z - r * 0.05, r * 0.16, r * 0.45, r * 0.16, 0, 0, -0.4), FLAME_OUT);
      return;
    case 'crystals':
      for (const [dx, h, tilt] of [[0, 0.6, 0], [-0.25, 0.4, 0.45], [0.25, 0.45, -0.45]] as const) {
        b.add(SHAPES.diamond(), place(x + dx * head.rx * 2, y, z, r * 0.12, r * h, r * 0.12, 0, 0.5, tilt), c.accent);
      }
      return;
    case 'tuft':
      for (const [dx, dz, s] of [[0, 0, 0.22], [-0.12, 0.05, 0.16], [0.13, -0.04, 0.17]] as const) {
        b.add(SHAPES.gem(0), place(x + dx * r * 2, y + r * 0.08, z + dz, r * s * 1.1, r * s, r * s), c.accent);
      }
      return;
    case 'spikes':
      // A row of spikes over the head and down the back.
      for (let i = 0; i < 4; i++) {
        b.add(SHAPES.cone(4), place(x, y - r * 0.12 - i * r * 0.12, z - i * r * 0.32, r * 0.1, r * (0.35 - i * 0.05), r * 0.1, -0.35 - i * 0.25), c.accent);
      }
      return;
    case 'fins':
      for (const s of SIDES) b.add(SHAPES.cone(3), place(x + s * head.rx * 0.95, head.y + r * 0.1, z, r * 0.06, r * 0.45, r * 0.22, 0, 0, -s * 1.1), c.accent);
      b.add(SHAPES.cone(3), place(x, y - r * 0.1, z - r * 0.1, r * 0.05, r * 0.4, r * 0.3), c.accent);
      return;
    case 'mushroom':
      b.add(SHAPES.dome(9), place(x, y - r * 0.15, z, head.rx * 1.05, r * 0.5, head.rz * 1.05), (p) =>
        Math.sin(p.x * 8) * Math.cos(p.z * 8) > 0.55 ? c.white : c.accent,
      );
      return;
    case 'crown':
      b.add(SHAPES.tube(8), place(x, y - r * 0.12, z, r * 0.36, r * 0.18, r * 0.36), GOLD);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        b.add(SHAPES.cone(4), place(x + Math.sin(a) * r * 0.3, y + r * 0.05, z + Math.cos(a) * r * 0.3, r * 0.07, r * 0.2, r * 0.07), GOLD);
      }
      b.add(SHAPES.gem(0), place(x, y - r * 0.03, z + r * 0.36, r * 0.06), RED);
      return;
    case 'chefhat':
      b.add(SHAPES.tube(8), place(x, y - r * 0.12, z, r * 0.34, r * 0.3, r * 0.34), c.white);
      for (const [dx, dz] of [[0, 0], [-0.2, 0.1], [0.2, 0.1], [0, -0.2]] as const) {
        b.add(SHAPES.gem(1), place(x + dx * r, y + r * 0.25, z + dz * r, r * 0.26), c.white);
      }
      return;
    case 'lid':
      b.add(SHAPES.dome(10), place(x, y - r * 0.08, z, head.rx * 0.95, r * 0.25, head.rz * 0.95), c.accent);
      b.add(SHAPES.gem(0), place(x, y + r * 0.2, z, r * 0.08), shade(c.accent, -0.3));
      return;
    case 'dragonhorns':
      for (const s of SIDES) {
        b.add(SHAPES.cone(5), place(x + s * head.rx * 0.45, y - r * 0.15, z - r * 0.15, r * 0.1, r * 0.6, r * 0.1, -0.7, 0, -s * 0.3), c.accent);
      }
      return;
    case 'unihorn':
      b.add(SHAPES.cone(6, 3), place(x, y - r * 0.15, z + head.rz * 0.35, r * 0.1, r * 0.7, r * 0.1, 0.35), (p) =>
        Math.floor(p.y * 3) % 2 ? GOLD : c.white,
      );
      return;
    case 'mane':
      for (let i = 0; i < 5; i++) {
        b.add(SHAPES.gem(0), place(x, y - r * 0.05 - i * r * 0.18, z - i * r * 0.22, r * 0.2, r * 0.18, r * 0.16), c.accent);
      }
      return;
    case 'frill':
      // A fan standing up behind the head, tipped back a little, with rays of two colors.
      b.add(SHAPES.dome(9), place(x, head.y - r * 0.2, z - head.rz * 0.6, head.rx * 1.5, head.ry * 1.4, r * 0.08, -0.3), (p) =>
        Math.floor(Math.atan2(p.y, p.x) * 3) % 2 ? c.accent : c.belly,
      );
      return;
  }
}
