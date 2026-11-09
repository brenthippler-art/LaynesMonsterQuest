import { NES } from '../../render/nesPalette';
import { checker, fill, grid, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';

/**
 * Bun Town Burgers' tiles, painted in code (16x16 each). The restaurant is red
 * and cream: red walls with a cream front and a red stripe, like a diner.
 * Walls are dark on the corner map so the rooms look outlined.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void): TileKind => ({ walkable: false, color, draw });

/** Red on top, a cream front with a red diner stripe (only where the front shows). */
const dinerWall = (c: TileCtx) => {
  wall(c, NES.red, NES.sand, NES.black);
  if (c.near(0, 1) !== c.near(0, 0)) rect(c, 0, 12, 16, 2, NES.redBright);
};
const asphalt = (c: TileCtx) => {
  fill(c, NES.gray);
  speckle(c, NES.grayLight, 5, 80);
  speckle(c, NES.black, 3, 81);
};
const grass = (c: TileCtx) => {
  fill(c, NES.greenBright);
  speckle(c, NES.green, 6, 82);
  speckle(c, NES.limeLight, 3, 83);
};
const alleyGround = (c: TileCtx) => {
  fill(c, NES.grayLight);
  speckle(c, NES.gray, 8, 84);
  speckle(c, NES.brownDark, 2, 85);
};
const lobby = (c: TileCtx) => checker(c, NES.white, NES.sand, 8);
const frost = (c: TileCtx) => {
  fill(c, NES.skyLight);
  speckle(c, NES.white, 8, 86);
  speckle(c, NES.mint, 3, 87);
};

/** The smiling bun: Bun Town's own sign (a bun with a happy face, no letters). */
const smilingBun = (c: TileCtx, x: number, y: number) => {
  rect(c, x + 2, y, 8, 1, NES.black);
  rect(c, x + 1, y + 1, 10, 4, NES.orange); // top bun
  rect(c, x + 2, y + 1, 3, 1, NES.orangeLight); // shine
  rect(c, x + 3, y + 2, 1, 1, NES.white); // sesame seeds
  rect(c, x + 7, y + 2, 1, 1, NES.white);
  rect(c, x + 4, y + 3, 1, 1, NES.black); // eyes
  rect(c, x + 7, y + 3, 1, 1, NES.black);
  rect(c, x + 4, y + 4, 4, 1, NES.redBright); // smile
  rect(c, x, y + 5, 12, 1, NES.greenBright); // lettuce
  rect(c, x + 1, y + 6, 10, 1, NES.brownRed); // patty
  rect(c, x + 1, y + 7, 10, 2, NES.orange); // bottom bun
};

export const BUNTOWN_TILES: Record<string, TileKind> = {
  // ---------- Outside ----------
  hedge: solid(NES.greenDark, (c) => {
    fill(c, NES.greenForest);
    speckle(c, NES.green, 10, 88);
    speckle(c, NES.greenDark, 6, 89);
  }),
  grass: floor(NES.greenBright, grass),
  lot: floor(NES.gray, asphalt),
  lotStripe: floor(NES.gray, (c) => {
    asphalt(c);
    rect(c, 7, 0, 2, 16, NES.white);
  }),
  sidewalk: floor(NES.grayLight, (c) => {
    grid(c, NES.grayLight, NES.gray, 8);
    speckle(c, NES.white, 3, 90);
  }),
  lane: floor(NES.gray, asphalt),
  /** The drive-thru lane with a painted yellow dash down the middle. */
  laneDash: floor(NES.gray, (c) => {
    asphalt(c);
    rect(c, 6, 6, 4, 4, NES.gold);
  }),
  alley: floor(NES.grayLight, alleyGround),
  fence: solid(NES.gray, (c) => {
    alleyGround(c);
    rect(c, 0, 1, 16, 1, NES.gray);
    for (let x = 1; x < 16; x += 4) rect(c, x, 1, 1, 14, NES.gray);
    for (let y = 3; y < 15; y += 3) for (let x = 0; x < 16; x += 2) rect(c, x + ((y / 3) % 2), y, 1, 1, NES.grayLight);
    rect(c, 0, 14, 16, 1, NES.gray);
  }),

  // ---------- Walls and doors ----------
  wall: solid(NES.brownRed, dinerWall),
  window: solid(NES.brownRed, (c) => {
    dinerWall(c);
    rect(c, 2, 2, 12, 9, NES.white);
    rect(c, 3, 3, 10, 7, NES.skyLight);
    rect(c, 7, 3, 2, 7, NES.white);
    rect(c, 4, 4, 1, 2, NES.white);
  }),
  /** The restaurant's own sign on the front wall. */
  signWall: solid(NES.brownRed, (c) => {
    dinerWall(c);
    rect(c, 1, 0, 14, 11, NES.black);
    rect(c, 2, 1, 12, 9, NES.sand);
    smilingBun(c, 2, 1);
  }),
  /** The drive-thru window, with a little sliding counter. */
  driveWindow: solid(NES.brownRed, (c) => {
    dinerWall(c);
    rect(c, 1, 1, 14, 10, NES.white);
    rect(c, 2, 2, 12, 7, NES.skyLight);
    rect(c, 8, 2, 1, 7, NES.white);
    rect(c, 1, 9, 14, 2, NES.grayLight);
    rect(c, 3, 3, 2, 2, NES.white);
  }),
  doorway: floor(NES.sand, lobby, { doorway: true }),
  frontDoor: floor(NES.skyLight, (c) => {
    lobby(c);
    rect(c, 1, 1, 14, 14, NES.gray);
    rect(c, 2, 2, 12, 12, NES.skyLight);
    rect(c, 3, 3, 2, 3, NES.white);
    rect(c, 2, 8, 12, 1, NES.gray); // push bar
  }, { doorway: true }),
  backDoor: floor(NES.grayLight, (c) => {
    alleyGround(c);
    rect(c, 1, 1, 14, 14, NES.gray);
    rect(c, 2, 2, 12, 12, NES.grayLight);
    rect(c, 10, 7, 2, 2, NES.gold); // handle
  }, { doorway: true }),
  /** The swinging half-door through the counter into the kitchen. */
  counterGate: floor(NES.sand, (c) => {
    lobby(c);
    rect(c, 0, 4, 16, 2, NES.red);
    rect(c, 0, 6, 16, 1, NES.brownRed);
  }, { doorway: true }),
  /** The long front counter (you walk around it through the gates). */
  counter: solid(NES.brownRed, (c) => {
    fill(c, NES.sand);
    rect(c, 0, 0, 16, 4, NES.white);
    rect(c, 0, 4, 16, 1, NES.black);
    rect(c, 0, 5, 16, 10, NES.redBright);
    rect(c, 0, 9, 16, 2, NES.sand);
    rect(c, 0, 15, 16, 1, NES.black);
  }),

  // ---------- Floors (one per room) ----------
  lobbyFloor: floor(NES.sand, lobby),
  diningFloor: floor(NES.salmon, (c) => checker(c, NES.sand, NES.redBright, 8)),
  sodaFloor: floor(NES.cyan, (c) => grid(c, NES.mint, NES.teal, 8)),
  grillFloor: floor(NES.orange, (c) => grid(c, NES.salmon, NES.brownRed, 8)),
  fryFloor: floor(NES.gold, (c) => grid(c, NES.yellowLight, NES.ochre, 8)),
  /** Soft padded squares in four bright colors. */
  playFloor: floor(NES.violet, (c) => {
    const colors = [NES.sky, NES.gold, NES.greenBright, NES.pink];
    fill(c, colors[(c.x + c.y * 2) % 4]);
    rect(c, 0, 15, 16, 1, NES.white);
    rect(c, 15, 0, 1, 16, NES.white);
  }),

  // ---------- The walk-in freezer ----------
  freezerFloor: floor(NES.skyLight, (c) => {
    grid(c, NES.grayLight, NES.white, 4);
    speckle(c, NES.skyLight, 6, 91);
  }),
  freezerWall: solid(NES.blueDark, (c) => {
    wall(c, NES.periwinkle, NES.skyLight, NES.black);
    if (c.near(0, 1) !== c.near(0, 0)) for (const x of [2, 7, 12]) rect(c, x, 10, 2, 3, NES.white); // icicles
  }),
  /** The big metal door in the kitchen (walk onto it to go into the freezer). */
  freezerDoor: floor(NES.white, (c) => {
    fill(c, NES.gray);
    rect(c, 1, 0, 14, 16, NES.grayLight);
    for (let y = 2; y < 16; y += 4) rect(c, 1, y, 14, 1, NES.gray);
    rect(c, 11, 6, 3, 2, NES.black); // big handle
    rect(c, 3, 1, 4, 3, NES.skyLight); // frosty window
  }),
  /** The same door from the inside, back out to the kitchen. */
  freezerExit: floor(NES.white, (c) => {
    frost(c);
    rect(c, 1, 0, 14, 16, NES.grayLight);
    rect(c, 2, 1, 12, 14, NES.white);
    rect(c, 5, 6, 6, 2, NES.gold); // warm push bar
  }),
};
