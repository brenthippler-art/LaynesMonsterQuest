import { type BufferGeometry } from 'three';
import { type Monster, type Size } from '../../monsters/monsterTypes';
import { MeshBuilder, place } from '../meshBuilder';
import { SHAPES } from '../shapes';
import { buildBody } from './bodies3d';
import { addFace } from './face3d';
import { type Egg, type Kit, makePaints, skinPaint } from './kit';
import { addArms, addFeet, addTail } from './limbs3d';
import { addTop } from './tops3d';

/**
 * A monster's 3D model, built from its data in this order: body → feet → arms
 * → tail → head top → face → extra heads. Built once per monster and kept
 * (one entry per monster, so the cache can't grow without limit), and emptied
 * when Layne leaves the world (forgetMonsterModels() in view3d.ts).
 */

/** How big each size is in 3D (1 = medium). A bit more spread out than the flat pictures. */
export const SIZE_3D: Record<Size, number> = { tiny: 0.72, small: 0.86, medium: 1, large: 1.22 };

const cache = new Map<string, BufferGeometry>();

export function monsterGeometry(m: Monster): BufferGeometry {
  let g = cache.get(m.id);
  if (!g) {
    g = buildMonster(m);
    cache.set(m.id, g);
  }
  return g;
}

/** Free every built model (when leaving a world). */
export function forgetMonsterModels(): void {
  for (const g of cache.values()) g.dispose();
  cache.clear();
}

function buildMonster(m: Monster): BufferGeometry {
  const k: Kit = { b: new MeshBuilder(), c: makePaints(m.colors), look: m.look };
  const f = buildBody(k, m.look.feet);
  addFeet(k, f, m.look.feet);
  addArms(k, f, m.look.arms);
  addTail(k, f, m.look.tail);
  if (m.look.extraTop) addTop(k, f.head, m.look.extraTop);
  addTop(k, f.head, m.look.top);
  addFace(k, f.head);
  addExtraHeads(k, f.head, m.look.heads ?? 1);
  return k.b.build()!;
}

/** Hydras and friends: smaller copies of the head on short necks, to the sides. */
function addExtraHeads(k: Kit, head: Egg, count: 1 | 2 | 3): void {
  if (count === 1) return;
  const sides = count === 2 ? [1] : [-1, 1];
  for (const s of sides) {
    const small: Egg = {
      x: head.x + s * head.rx * 1.25,
      y: head.y - head.ry * 0.15,
      z: head.z - head.rz * 0.25,
      rx: head.rx * 0.7,
      ry: head.ry * 0.7,
      rz: head.rz * 0.7,
    };
    k.b.add(SHAPES.taper(0.8, 6), place(small.x * 0.6, head.y - head.ry * 1.1, small.z, 0.08, head.ry * 0.9, 0.08, 0, 0, -s * 0.5), k.c.main);
    k.b.add(SHAPES.ball(9, 7), place(small.x, small.y, small.z, small.rx, small.ry, small.rz), skinPaint(k, false));
    addTop(k, small, k.look.top);
    addFace(k, small, true);
  }
}
