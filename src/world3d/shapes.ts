import {
  BoxGeometry,
  type BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

/**
 * The basic building blocks, all made ONCE and shared. Few faces on purpose:
 * that's the chunky Nintendo 64 look (and it's fast on a tablet).
 * Every shape is 1 unit "big" around its middle (radius 1, or 1 tall), so
 * place() in meshBuilder.ts stretches it to the size it needs.
 */
const cache = new Map<string, BufferGeometry>();

function shared(key: string, make: () => BufferGeometry): BufferGeometry {
  let g = cache.get(key);
  if (!g) {
    // "Non-indexed": every triangle gets its own corners, so faces can have their own colors and flat light.
    const made = make();
    g = made.index ? made.toNonIndexed() : made; // (a few shapes are made non-indexed already)
    cache.set(key, g);
  }
  return g;
}

export const SHAPES = {
  /** A ball made of triangles. detail 0 = 20 faces (very chunky), 1 = 80 faces. */
  gem: (detail = 0) => shared(`gem${detail}`, () => new IcosahedronGeometry(1, detail)),
  /** A smoother ball with rings, like a globe. Good for heads and bodies. */
  ball: (around = 10, rings = 7) => shared(`ball${around}x${rings}`, () => new SphereGeometry(1, around, rings)),
  /** Half a ball, flat side down (hair, mushroom caps, domes). */
  dome: (around = 10) => shared(`dome${around}`, () => new SphereGeometry(1, around, 4, 0, Math.PI * 2, 0, Math.PI / 2)),
  /** A cube from -0.5 to 0.5. */
  box: () => shared('box', () => new BoxGeometry(1, 1, 1)),
  /** A cone 1 tall, base on y = 0, tip on y = 1. `rows` > 1 cuts it into bands that can be painted different colors. */
  cone: (around = 6, rows = 1) => shared(`cone${around}x${rows}`, () => new ConeGeometry(1, 1, around, rows).translate(0, 0.5, 0)),
  /** A can 1 tall, from y = 0 to y = 1. */
  tube: (around = 6, rows = 1) => shared(`tube${around}x${rows}`, () => new CylinderGeometry(1, 1, 1, around, rows).translate(0, 0.5, 0)),
  /** A can that's narrower at the top (tree trunks, legs). */
  taper: (top = 0.6, around = 6, rows = 1) =>
    shared(`taper${top}x${around}x${rows}`, () => new CylinderGeometry(top, 1, 1, around, rows).translate(0, 0.5, 0)),
  /** A flat disc lying on the ground (radius 1, very thin). */
  disc: (around = 10) => shared(`disc${around}`, () => new CylinderGeometry(1, 1, 0.02, around)),
  /** A rock: 12 flat sides. */
  rock: () => shared('rock', () => new DodecahedronGeometry(1, 0)),
  /** A diamond: 8 flat sides (crystals, the tap-to-walk marker). */
  diamond: () => shared('diamond', () => new OctahedronGeometry(1, 0)),
  /** A ring (glasses frames, smiles). arc = how much of the circle (Math.PI * 2 = all of it). */
  ring: (tube = 0.25, arc = Math.PI * 2) =>
    shared(`ring${tube}x${arc.toFixed(3)}`, () => new TorusGeometry(1, tube, 4, arc < Math.PI * 2 ? 6 : 10, arc)),
};
