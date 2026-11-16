import { type Vector3 } from 'three';
import { NES } from '../../render/nesPalette';
import { Decor } from '../../world/decorations';
import { type MeshBuilder, place, rgb } from '../meshBuilder';
import { type Spot } from '../props';
import { SHAPES } from '../shapes';

/**
 * The island's decorations in 3D: one small function per kind, built from a
 * handful of chunky shapes. Sizes are in tiles (Layne is about 1 tile tall).
 * Layne can still walk through all of them, like on the flat map.
 */
type Maker = (s: Spot, lit: MeshBuilder, glow: MeshBuilder) => void;

const C = {
  trunk: rgb(NES.brownDark),
  leaf: rgb(NES.green),
  leafLight: rgb(NES.greenBright),
  pine: rgb(NES.greenForest),
  snow: rgb(NES.white),
  palmLeaf: rgb(NES.greenSea),
  coconut: rgb(NES.brownRed),
  cactus: rgb(NES.greenSea),
  rock: rgb(NES.gray),
  rockLight: rgb(NES.grayLight),
  grass: rgb(NES.lime),
  stem: rgb(NES.green),
  lava: rgb(NES.orangeLight),
  reed: rgb(NES.ochre),
  cattail: rgb(NES.brownDark),
  water: rgb(NES.sky),
  mushStem: rgb(NES.sand),
  mushCap: rgb(NES.redBright),
  shell: rgb(NES.pinkLight),
  yellow: rgb(NES.gold),
};
const FLOWERS = [NES.redBright, NES.pink, NES.gold, NES.white, NES.purple].map(rgb);
const CRYSTALS = [NES.cyan, NES.lavender, NES.skyLight].map(rgb);
const TAU = Math.PI * 2;

const tree: Maker = (s, lit) => {
  const k = 0.85 + s.r1 * 0.35; // trees come in a few sizes
  lit.add(SHAPES.taper(0.7), place(s.x, s.y, s.z, 0.1 * k, 0.75 * k, 0.1 * k), C.trunk);
  lit.add(SHAPES.gem(0), place(s.x, s.y + 1.0 * k, s.z, 0.55 * k, 0.48 * k, 0.55 * k, 0, s.r2 * TAU), C.leaf);
  lit.add(SHAPES.gem(0), place(s.x + 0.15, s.y + 1.3 * k, s.z - 0.1, 0.32 * k, 0.3 * k, 0.32 * k, 0, s.r1 * TAU), C.leafLight);
};

function pineTree(s: Spot, lit: MeshBuilder, snowy: boolean): void {
  const k = 0.85 + s.r1 * 0.4;
  lit.add(SHAPES.tube(5), place(s.x, s.y, s.z, 0.08 * k, 0.4 * k, 0.08 * k), C.trunk);
  // Three cones stacked up, each smaller. Snowy pines get white tips.
  for (let n = 0; n < 3; n++) {
    const r = (0.55 - n * 0.14) * k;
    const paint = snowy ? (p: Vector3) => (p.y > 0.55 ? C.snow : C.pine) : C.pine;
    lit.add(SHAPES.cone(7, 3), place(s.x, s.y + (0.3 + n * 0.38) * k, s.z, r, 0.7 * k, r, 0, s.r2 * TAU + n), paint);
  }
}

const palm: Maker = (s, lit) => {
  // A trunk that leans: three pieces, each tipped a little more.
  const lean = (s.r1 - 0.5) * 0.5;
  let x = s.x;
  let y = s.y;
  for (let n = 0; n < 3; n++) {
    lit.add(SHAPES.taper(0.85, 5), place(x, y, s.z, 0.08, 0.5, 0.08, 0, 0, -lean * (n + 1) * 0.5), C.trunk);
    x += Math.sin(lean * (n + 1) * 0.5) * 0.5;
    y += 0.48;
  }
  for (let n = 0; n < 5; n++) {
    const turn = (n / 5) * TAU + s.r2;
    // Each leaf: a long flat cone pointing out and drooping down.
    lit.add(SHAPES.cone(4), place(x, y, s.z, 0.12, 0.75, 0.03, 0, turn, 2.0), C.palmLeaf);
  }
  lit.add(SHAPES.gem(0), place(x + 0.08, y - 0.08, s.z, 0.09), C.coconut);
  lit.add(SHAPES.gem(0), place(x - 0.06, y - 0.1, s.z + 0.07, 0.09), C.coconut);
};

const cactus: Maker = (s, lit) => {
  const k = 0.8 + s.r1 * 0.4;
  lit.add(SHAPES.tube(6), place(s.x, s.y, s.z, 0.14 * k, 0.9 * k, 0.14 * k), C.cactus);
  lit.add(SHAPES.dome(6), place(s.x, s.y + 0.9 * k, s.z, 0.14 * k), C.cactus);
  // Two arms that bend upward.
  for (const side of [-1, 1]) {
    const h = (0.35 + (side > 0 ? s.r2 : 1 - s.r2) * 0.25) * k;
    lit.add(SHAPES.tube(5), place(s.x + side * 0.2 * k, s.y + h, s.z, 0.08 * k, 0.04, 0.08 * k, 0, 0, Math.PI / 2), C.cactus);
    lit.add(SHAPES.tube(5), place(s.x + side * 0.24 * k, s.y + h, s.z, 0.08 * k, 0.3 * k, 0.08 * k), C.cactus);
  }
};

const rock: Maker = (s, lit) => {
  const k = 0.25 + s.r1 * 0.2;
  lit.add(SHAPES.rock(), place(s.x, s.y + k * 0.35, s.z, k * 1.2, k * 0.8, k, s.r2, s.r1 * TAU), C.rock);
};

const snowDrift: Maker = (s, lit) => {
  lit.add(SHAPES.dome(7), place(s.x, s.y - 0.02, s.z, 0.45, 0.22, 0.35, 0, s.r1 * TAU), C.snow);
};

const tallGrass: Maker = (s, lit) => {
  for (let n = 0; n < 5; n++) {
    const turn = n * 1.3 + s.r1 * TAU;
    const dx = Math.cos(turn) * 0.15;
    const dz = Math.sin(turn) * 0.15;
    lit.add(SHAPES.cone(3), place(s.x + dx, s.y, s.z + dz, 0.05, 0.35 + ((n * 7) % 3) * 0.08, 0.05, dz, turn, -dx), C.grass);
  }
};

const flower: Maker = (s, lit) => {
  const petal = FLOWERS[Math.floor(s.r1 * FLOWERS.length)];
  lit.add(SHAPES.tube(4), place(s.x, s.y, s.z, 0.02, 0.3, 0.02), C.stem);
  for (let n = 0; n < 5; n++) {
    const turn = (n / 5) * TAU;
    lit.add(SHAPES.gem(0), place(s.x + Math.cos(turn) * 0.07, s.y + 0.32, s.z + Math.sin(turn) * 0.07, 0.06, 0.03, 0.06), petal);
  }
  lit.add(SHAPES.gem(0), place(s.x, s.y + 0.33, s.z, 0.04), C.yellow);
};

const bush: Maker = (s, lit) => {
  lit.add(SHAPES.gem(0), place(s.x, s.y + 0.2, s.z, 0.3, 0.25, 0.3, 0, s.r1 * TAU), C.leaf);
  lit.add(SHAPES.gem(0), place(s.x + 0.2, s.y + 0.15, s.z + 0.08, 0.2, 0.18, 0.2), C.leafLight);
  lit.add(SHAPES.gem(0), place(s.x - 0.18, s.y + 0.14, s.z - 0.05, 0.2, 0.17, 0.2), C.leaf);
};

const lavaCrack: Maker = (s, _lit, glow) => {
  // Glowing lines on the ground, in a zigzag.
  for (let n = 0; n < 3; n++) {
    const turn = s.r1 * TAU + n * 0.9;
    glow.add(SHAPES.box(), place(s.x + (n - 1) * 0.12, s.y + 0.02, s.z + (n - 1) * 0.1 * (s.r2 - 0.5), 0.3, 0.03, 0.05, 0, turn), C.lava);
  }
};

const reeds: Maker = (s, lit) => {
  for (let n = 0; n < 4; n++) {
    const dx = ((n % 2) - 0.5) * 0.2 + (s.r1 - 0.5) * 0.1;
    const dz = (Math.floor(n / 2) - 0.5) * 0.2;
    const h = 0.5 + ((n * 5 + Math.floor(s.r2 * 10)) % 4) * 0.08;
    lit.add(SHAPES.tube(3), place(s.x + dx, s.y, s.z + dz, 0.02, h, 0.02), C.reed);
    lit.add(SHAPES.tube(4), place(s.x + dx, s.y + h - 0.05, s.z + dz, 0.04, 0.14, 0.04), C.cattail);
  }
};

const puddle: Maker = (s, lit) => {
  lit.add(SHAPES.disc(8), place(s.x, s.y + 0.02, s.z, 0.38, 1, 0.28, 0, s.r1 * TAU), C.water);
};

const crystal: Maker = (s, _lit, glow) => {
  const color = CRYSTALS[Math.floor(s.r1 * CRYSTALS.length)];
  glow.add(SHAPES.diamond(), place(s.x, s.y + 0.3, s.z, 0.13, 0.4, 0.13, 0, s.r2, 0.15), color);
  glow.add(SHAPES.diamond(), place(s.x + 0.15, s.y + 0.15, s.z + 0.05, 0.08, 0.22, 0.08, 0, 0, -0.4), color);
};

const mushroom: Maker = (s, lit) => {
  lit.add(SHAPES.tube(5), place(s.x, s.y, s.z, 0.06, 0.2, 0.06), C.mushStem);
  lit.add(SHAPES.dome(7), place(s.x, s.y + 0.18, s.z, 0.17, 0.13, 0.17), (p: Vector3) =>
    // White dots on the red cap.
    Math.sin(p.x * 9) * Math.cos(p.z * 9) > 0.6 ? C.snow : C.mushCap,
  );
};

const pebbles: Maker = (s, lit) => {
  for (let n = 0; n < 3; n++) {
    const turn = n * 2.1 + s.r1 * TAU;
    lit.add(SHAPES.gem(0), place(s.x + Math.cos(turn) * 0.18, s.y + 0.03, s.z + Math.sin(turn) * 0.18, 0.07, 0.05, 0.07), n ? C.rock : C.rockLight);
  }
};

const shell: Maker = (s, lit) => {
  lit.add(SHAPES.cone(6), place(s.x, s.y + 0.02, s.z, 0.12, 0.12, 0.12, Math.PI / 2 - 0.2, s.r1 * TAU), C.shell);
};

const MAKERS: Partial<Record<number, Maker>> = {
  [Decor.Tree]: tree,
  [Decor.Pine]: (s, lit) => pineTree(s, lit, false),
  [Decor.SnowPine]: (s, lit) => pineTree(s, lit, true),
  [Decor.Palm]: palm,
  [Decor.Cactus]: cactus,
  [Decor.Rock]: rock,
  [Decor.SnowDrift]: snowDrift,
  [Decor.TallGrass]: tallGrass,
  [Decor.Flower]: flower,
  [Decor.Bush]: bush,
  [Decor.LavaCrack]: lavaCrack,
  [Decor.Reeds]: reeds,
  [Decor.Puddle]: puddle,
  [Decor.Crystal]: crystal,
  [Decor.Mushroom]: mushroom,
  [Decor.Pebbles]: pebbles,
  [Decor.Shell]: shell,
};

export function addIslandDecor(decor: number, s: Spot, lit: MeshBuilder, glow: MeshBuilder): void {
  MAKERS[decor]?.(s, lit, glow);
}
