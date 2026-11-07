import { NES } from '../../render/nesPalette';
import { checker, fill, grid, planks, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';

/**
 * Home Sweet Home's tiles, painted in code (16x16 each). Walls are dark on the
 * corner map so the rooms look outlined; floors each have their own color.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void): TileKind => ({ walkable: false, color, draw });

const houseWall = (c: TileCtx) => wall(c, NES.brownRed, NES.sand, NES.black);
const atticWall = (c: TileCtx) => wall(c, NES.brownDark, NES.ochre, NES.black);
const hall = (c: TileCtx) => planks(c, NES.ochre, NES.brownDark, NES.yellowLight);
const attic = (c: TileCtx) => planks(c, NES.brownRed, NES.brownDark, NES.orange);
const cozyCarpet = (c: TileCtx) => {
  fill(c, NES.orangeLight);
  speckle(c, NES.yellowLight, 6, 40);
  speckle(c, NES.orange, 4, 41);
};
const concrete = (c: TileCtx) => {
  fill(c, NES.grayLight);
  speckle(c, NES.gray, 7, 30);
  speckle(c, NES.white, 2, 31);
};
const grass = (c: TileCtx) => {
  fill(c, NES.greenBright);
  speckle(c, NES.green, 6, 10);
  speckle(c, NES.limeLight, 3, 11);
};

/** Steps: stripes getting darker (going down) or lighter (going up). */
const steps = (c: TileCtx, colors: string[]) => {
  colors.forEach((hex, i) => rect(c, 1, i * 4, 14, 4, hex));
  for (let i = 1; i < 4; i++) rect(c, 1, i * 4, 14, 1, NES.black);
  rect(c, 0, 0, 1, 16, NES.black);
  rect(c, 15, 0, 1, 16, NES.black);
};

/** A wooden ladder: two rails and rungs. */
const ladder = (c: TileCtx) => {
  rect(c, 3, 0, 2, 16, NES.brownRed);
  rect(c, 11, 0, 2, 16, NES.brownRed);
  for (let y = 2; y < 16; y += 4) rect(c, 3, y, 10, 2, NES.orange);
};

export const HOME_TILES: Record<string, TileKind> = {
  // ---------- Outside ----------
  grass: floor(NES.greenBright, grass),
  path: floor(NES.grayLight, (c) => {
    grid(c, NES.grayLight, NES.gray, 8);
    speckle(c, NES.white, 3, 20);
  }),
  drive: floor(NES.grayLight, concrete),
  soil: floor(NES.brownDark, (c) => {
    fill(c, NES.brownDark);
    speckle(c, NES.ochre, 6, 50);
    speckle(c, NES.brownRed, 4, 51);
  }),
  sand: floor(NES.sand, (c) => {
    fill(c, NES.sand);
    speckle(c, NES.orangeLight, 6, 52);
    speckle(c, NES.white, 2, 53);
  }),
  fence: solid(NES.brownRed, (c) => {
    grass(c);
    for (const x of [1, 5, 9, 13]) {
      rect(c, x, 2, 3, 13, NES.white);
      rect(c, x + 2, 3, 1, 12, NES.grayLight);
    }
    rect(c, 0, 6, 16, 2, NES.white);
    rect(c, 0, 12, 16, 2, NES.white);
  }),

  // ---------- Walls and doors ----------
  wall: solid(NES.brownDark, houseWall),
  window: solid(NES.brownDark, (c) => {
    houseWall(c);
    rect(c, 3, 3, 10, 9, NES.white);
    rect(c, 4, 4, 8, 7, NES.skyLight);
    rect(c, 7, 4, 2, 7, NES.white);
    rect(c, 5, 5, 1, 2, NES.white);
  }),
  posterWall: solid(NES.brownDark, (c) => {
    houseWall(c);
    rect(c, 4, 1, 8, 8, NES.white);
    rect(c, 5, 2, 6, 6, NES.sky);
    rect(c, 7, 3, 2, 2, NES.gold); // a star
    rect(c, 6, 5, 4, 1, NES.gold);
  }),
  doorway: floor(NES.ochre, hall, { doorway: true }),
  frontDoor: floor(NES.redBright, (c) => {
    hall(c);
    rect(c, 2, 3, 12, 10, NES.redBright);
    rect(c, 3, 4, 10, 8, NES.orange);
    for (let x = 4; x < 12; x += 2) rect(c, x, 5, 1, 6, NES.redBright);
  }, { doorway: true }),
  garageDoor: floor(NES.grayLight, (c) => {
    concrete(c);
    for (let x = 0; x < 16; x += 4) {
      rect(c, x, 0, 2, 2, NES.gold);
      rect(c, x + 2, 0, 2, 2, NES.black);
    }
  }, { doorway: true }),

  // ---------- Floors (one per room) ----------
  kitchenFloor: floor(NES.salmon, (c) => checker(c, NES.white, NES.salmon, 8)),
  carpet: floor(NES.periwinkle, (c) => {
    fill(c, NES.periwinkle);
    speckle(c, NES.pastelBlue, 8, 60);
  }),
  bathTile: floor(NES.skyLight, (c) => grid(c, NES.skyLight, NES.white, 4)),
  bedroomCarpet: floor(NES.mint, (c) => {
    fill(c, NES.mint);
    speckle(c, NES.gold, 2, 61); // little stars
    speckle(c, NES.seafoam, 5, 62);
  }),
  laundryFloor: floor(NES.lavender, (c) => grid(c, NES.lavender, NES.white, 8)),
  hallFloor: floor(NES.ochre, hall),
  concrete: floor(NES.grayLight, concrete),

  // ---------- Attic ----------
  atticFloor: floor(NES.brownRed, attic),
  atticWall: solid(NES.black, atticWall),
  roundWindow: solid(NES.black, (c) => {
    atticWall(c);
    rect(c, 5, 2, 6, 10, NES.white);
    rect(c, 3, 4, 10, 6, NES.white);
    rect(c, 6, 3, 4, 8, NES.skyLight);
    rect(c, 4, 5, 8, 4, NES.skyLight);
    rect(c, 7, 3, 2, 8, NES.white);
    rect(c, 4, 6, 8, 2, NES.white);
  }),
  hatch: floor(NES.gold, (c) => {
    attic(c);
    rect(c, 2, 2, 12, 12, NES.black);
    ladder(c);
  }),

  // ---------- Basement (a warm, cozy rec room) ----------
  basementFloor: floor(NES.orangeLight, cozyCarpet),
  basementWall: solid(NES.gray, (c) => {
    wall(c, NES.gray, NES.grayLight, NES.black);
    // Cinder blocks on the front face.
    if (c.near(0, 1) !== c.near(0, 0)) for (const x of [4, 12]) rect(c, x, 10, 1, 6, NES.gray);
  }),

  // ---------- Stairs and ladders ----------
  ladderUp: floor(NES.gold, (c) => {
    hall(c);
    ladder(c);
  }),
  stairsDown: floor(NES.gold, (c) => steps(c, [NES.yellowLight, NES.ochre, NES.brownRed, NES.brownDark])),
  stairsUp: floor(NES.gold, (c) => steps(c, [NES.brownRed, NES.ochre, NES.yellowLight, NES.white])),
};
