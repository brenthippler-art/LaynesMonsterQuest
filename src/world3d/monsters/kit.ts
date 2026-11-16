import { type Color, Vector3 } from 'three';
import { hash2 } from '../../core/rng';
import { type Look, type Palette } from '../../monsters/monsterTypes';
import { NES } from '../../render/nesPalette';
import { type MeshBuilder, rgb, shade } from '../meshBuilder';

/**
 * Shared bits for building a monster in 3D. Every monster is made from the SAME
 * data as its pixel picture (body, eyes, mouth, top, tail, feet, arms, pattern,
 * colors), so all 864 monsters get a 3D model without anyone drawing one by hand.
 *
 * The model faces +z (forward), stands on y = 0, and a medium monster is about
 * 0.8 tiles tall. Sizes here are in tiles.
 */
export interface Paints {
  main: Color;
  accent: Color;
  belly: Color;
  eye: Color;
  feet: Color;
  wing: Color;
  beak: Color;
  dark: Color; // a darker main color, for under-sides and nostrils
  white: Color;
  ink: Color; // eyes and mouth lines
  mouth: Color;
  tongue: Color;
  blush: Color;
}

/** An egg shape: middle (x, y, z) and half-sizes. Bodies and heads are described like this. */
export interface Egg {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

/** Where everything attaches, worked out by the body. */
export interface Frame {
  body: Egg;
  /** The face goes on the front of this (on round monsters, it's the body itself). */
  head: Egg;
  /** Four legs (beasts, dragons, long bodies) instead of two feet. */
  fourLegs: boolean;
  /** Height of the bottom of the body (the feet fill the gap to the ground). */
  lift: number;
  /** A living object (bowl, appliance, cart): no tummy patch. */
  object: boolean;
}

export interface Kit {
  b: MeshBuilder;
  c: Paints;
  look: Look;
}

export function makePaints(colors: Palette): Paints {
  const main = rgb(colors.main);
  return {
    main,
    accent: rgb(colors.accent),
    belly: rgb(colors.belly),
    eye: rgb(colors.eye ?? colors.accent),
    feet: rgb(colors.feet ?? colors.main),
    wing: rgb(colors.wing ?? colors.accent),
    beak: rgb(colors.feet && colors.feet !== colors.main ? colors.feet : NES.gold),
    dark: shade(main, -0.3),
    white: rgb('#FFFFFF'),
    ink: rgb('#202020'),
    mouth: rgb('#A81000'),
    tongue: rgb('#F87858'),
    blush: rgb(NES.pinkLight),
  };
}

const SPRINKLES = [NES.redBright, NES.gold, NES.sky, NES.pink, NES.white].map(rgb);

/**
 * The body's skin: main color, a lighter tummy, and the pattern, painted onto a
 * ball-shaped body (p = a spot on the ball, each part -1..1; +z is the front).
 */
export function skinPaint(k: Kit, object: boolean): (p: Vector3) => Color {
  const { c, look } = k;
  const glowMain = shade(c.main, 0.35);
  const scale = shade(c.main, -0.18);
  return (p) => {
    if (look.belly && !object && p.z > 0.45 && p.y < 0.3 && p.y > -0.8 && Math.abs(p.x) < 0.62) return c.belly;
    switch (look.pattern) {
      case 'spots':
        return Math.sin(p.x * 7) * Math.sin(p.y * 7 + 1) * Math.sin(p.z * 7 + 2) > 0.3 ? c.accent : c.main;
      case 'stripes':
        return Math.floor((p.y + 1) * 4.5) % 2 && p.z < 0.7 ? c.accent : c.main;
      case 'checks':
        return (Math.floor((p.x + 1) * 3) + Math.floor((p.y + 1) * 3) + Math.floor((p.z + 1) * 3)) % 2 ? c.accent : c.main;
      case 'patches':
        return Math.sin(p.x * 3 + 1) * Math.cos(p.z * 3) + Math.sin(p.y * 4) > 0.9 ? c.accent : c.main;
      case 'scales':
        return (Math.floor(Math.atan2(p.z, p.x) * 3) + Math.floor(p.y * 5)) % 2 ? scale : c.main;
      case 'cracks':
        return Math.abs(Math.sin(p.x * 9 + p.y * 5 + p.z * 3)) < 0.18 ? c.accent : c.main;
      case 'glow':
        return p.y > 0.55 ? c.accent : glowMain;
      case 'sprinkles': {
        const r = hash2(Math.round(p.x * 20), Math.round(p.y * 20) * 41 + Math.round(p.z * 20), 5);
        return r < 0.22 ? SPRINKLES[Math.floor(r * 100) % SPRINKLES.length] : c.main;
      }
      default:
        return c.main;
    }
  };
}

/** A spot on the front of an egg: across (dx) and up (dy), each -1..1 of its size. Pushed out by `out` tiles. */
export function onFront(e: Egg, dx: number, dy: number, out = 0): Vector3 {
  const nx = Math.max(-0.95, Math.min(0.95, dx));
  const ny = Math.max(-0.95, Math.min(0.95, dy));
  const nz = Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny));
  return new Vector3(e.x + nx * e.rx, e.y + ny * e.ry, e.z + nz * (e.rz + out));
}

/** Top of an egg (where hats, ears and horns go). */
export function topOf(e: Egg): number {
  return e.y + e.ry;
}
