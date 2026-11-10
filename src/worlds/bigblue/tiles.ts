import { NES } from '../../render/nesPalette';
import { checker, fill, grid, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';

/**
 * Big Blue Mart's tiles, painted in code (16x16 each). A giant supercenter:
 * blue walls with a yellow stripe, a huge parking lot out front, a fenced garden
 * center on the left, an auto center on the right, and shelves of goods between
 * the departments inside. Walls are dark on the corner map so the rooms look outlined.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void): TileKind => ({ walkable: false, color, draw });

/** Does the front of this wall show? (Only when the square below it is something else.) */
const faceShows = (c: TileCtx) => c.near(0, 1) !== c.near(0, 0);

/** The store's wall: blue on top, a lighter blue front with a yellow stripe across it. */
const blueWall = (c: TileCtx) => {
  wall(c, NES.blue, NES.blueMid, NES.blueDark);
  if (faceShows(c)) rect(c, 0, 12, 16, 2, NES.gold);
};

const asphalt = (c: TileCtx) => {
  fill(c, NES.gray);
  speckle(c, NES.grayLight, 5, 230);
  speckle(c, NES.black, 3, 231);
};

/** The store's shiny floor: big pale squares with a soft gray seam. */
const storeTiles = (c: TileCtx) => {
  grid(c, NES.white, NES.grayLight, 16);
  speckle(c, NES.pastelBlue, 2, 232);
};

/**
 * One parking space. A white line down its left side, and a white line across the end
 * that faces the driving lane (spaces come in pairs, nose to nose).
 */
const stall = (c: TileCtx) => {
  asphalt(c);
  rect(c, 0, 0, 1, 16, NES.white);
  const above = c.near(0, -1);
  const below = c.near(0, 1);
  const isStall = (name: string) => name === 'stall';
  if (!isStall(above)) rect(c, 0, 0, 16, 1, NES.white);
  if (!isStall(below)) rect(c, 0, 15, 16, 1, NES.white);
  // The pair's middle line, where two cars park nose to nose.
  if (isStall(below)) rect(c, 0, 15, 16, 1, NES.grayLight);
};

/** Big Blue Mart's own sign: a smiling yellow shopping bag (drawn here, so it's nobody else's logo). */
const BAG = [
  '....kkkk....',
  '...k....k...',
  '...k....k...',
  '.kkkkkkkkkk.',
  '.kYYYYYYYYk.',
  '.kYYkYYkYYk.',
  '.kYYYYYYYYk.',
  '.kYpYYYYpYk.',
  '.kYkYYYYkYk.',
  '.kYYkkkkYYk.',
  '.kYYYYYYYYk.',
  '.kkkkkkkkkk.',
];
const BAG_COLORS: Record<string, string> = { k: NES.black, Y: NES.gold, p: NES.salmon };
export const drawBagFace = (c: TileCtx, x: number, y: number) => {
  BAG.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '.') rect(c, x + dx, y + dy, 1, 1, BAG_COLORS[row[dx]]);
  });
};

/**
 * A shelf full of goods between departments, seen from above: a gray metal top, and
 * where its front shows, three rows of colorful boxes and cans.
 */
const GOODS = [NES.redBright, NES.gold, NES.green, NES.sky, NES.orange, NES.pink, NES.purple, NES.white];
const shelf = (c: TileCtx) => {
  wall(c, NES.grayLight, NES.gray, NES.black);
  if (!faceShows(c)) return;
  for (let row = 0; row < 3; row++) {
    const y = 10 + row * 2;
    for (let k = 0; k < 4; k++) {
      const pick = (c.x * 7 + c.y * 3 + row * 5 + k * 11) % GOODS.length;
      rect(c, 1 + k * 4, y, 3, 1, GOODS[pick]);
    }
  }
};

/** A long freezer case: a white top, and where its front shows, frosty glass doors with handles. */
const freezer = (c: TileCtx) => {
  wall(c, NES.white, NES.skyLight, NES.blueDark);
  if (!faceShows(c)) {
    rect(c, 2, 4, 12, 1, NES.skyLight);
    return;
  }
  rect(c, 0, 10, 16, 6, NES.skyLight);
  rect(c, 7, 10, 2, 6, NES.white); // the gap between two doors
  rect(c, 2, 11, 1, 3, NES.white); // frost streaks
  rect(c, 11, 12, 1, 3, NES.white);
  rect(c, 5, 13, 1, 2, NES.gray); // handles
  rect(c, 10, 13, 1, 2, NES.gray);
};

/** The garden center's fence: white posts and rails, with a little vine on some posts. */
const gardenFence = (c: TileCtx) => {
  gardenPavers(c);
  rect(c, 0, 5, 16, 2, NES.white);
  rect(c, 0, 11, 16, 2, NES.white);
  for (const x of [1, 6, 11]) {
    rect(c, x, 2, 3, 14, NES.white);
    rect(c, x + 1, 1, 1, 1, NES.white);
  }
  if ((c.x + c.y) % 3 === 0) {
    rect(c, 2, 8, 1, 3, NES.green);
    rect(c, 7, 4, 1, 2, NES.green);
    rect(c, 3, 7, 1, 1, NES.pink);
  }
};

/** Square concrete pavers in the garden center, with a little dirt between them. */
const gardenPavers = (c: TileCtx) => {
  grid(c, NES.sand, NES.ochre, 8);
  speckle(c, NES.yellowLight, 3, 233);
  speckle(c, NES.greenBright, 1, 234);
};

/** The auto center's concrete floor, with a few oil spots. */
const garage = (c: TileCtx) => {
  fill(c, NES.grayLight);
  speckle(c, NES.gray, 6, 235);
  if ((c.x * 5 + c.y * 3) % 11 === 0) rect(c, 5, 6, 4, 3, NES.gray);
};

export const BIGBLUE_TILES: Record<string, TileKind> = {
  // ---------- Outside: the parking lot ----------
  hedge: solid(NES.greenDark, (c) => {
    fill(c, NES.greenForest);
    speckle(c, NES.green, 10, 236);
    speckle(c, NES.greenDark, 6, 237);
  }),
  lot: floor(NES.gray, asphalt),
  stall: floor(NES.gray, stall),
  /** Wide white stripes from the lot to the front doors. */
  crosswalk: floor(NES.white, (c) => {
    asphalt(c);
    for (const x of [1, 6, 11]) rect(c, x, 0, 4, 16, NES.white);
  }),
  sidewalk: floor(NES.grayLight, (c) => {
    grid(c, NES.grayLight, NES.gray, 8);
    speckle(c, NES.white, 3, 238);
  }),

  // ---------- The garden center ----------
  fence: solid(NES.white, gardenFence),
  gardenFloor: floor(NES.sand, gardenPavers),
  /** An open gate in the garden fence. */
  gate: floor(NES.sand, (c) => {
    gardenPavers(c);
    rect(c, 0, 0, 2, 16, NES.white);
    rect(c, 14, 0, 2, 16, NES.white);
  }, { doorway: true }),

  // ---------- The auto center ----------
  garageFloor: floor(NES.grayLight, garage),
  /** Yellow lines that split the service bays. */
  bayLine: floor(NES.grayLight, (c) => {
    garage(c);
    rect(c, 6, 0, 4, 16, NES.gold);
  }),
  /** A roll-up service door, rolled all the way up: the yellow-and-black edge shows at the top. */
  bayDoor: floor(NES.grayLight, (c) => {
    garage(c);
    for (let x = 0; x < 16; x += 4) {
      rect(c, x, 0, 2, 3, NES.gold);
      rect(c, x + 2, 0, 2, 3, NES.black);
    }
  }, { doorway: true }),

  // ---------- Walls, windows and doors ----------
  wall: solid(NES.blueDark, blueWall),
  window: solid(NES.blueDark, (c) => {
    blueWall(c);
    rect(c, 2, 1, 12, 9, NES.white);
    rect(c, 3, 2, 10, 7, NES.skyLight);
    rect(c, 4, 3, 2, 2, NES.white);
  }),
  /** The sign by the front doors: the smiling shopping bag on a big blue board. */
  signWall: solid(NES.blueDark, (c) => {
    blueWall(c);
    rect(c, 1, 0, 14, 13, NES.white);
    rect(c, 2, 1, 12, 11, NES.blueMid);
    drawBagFace(c, 2, 0);
  }),
  /** The big sliding front doors: two glass panels in a yellow frame. */
  slideDoor: floor(NES.skyLight, (c) => {
    storeTiles(c);
    rect(c, 0, 1, 16, 14, NES.gold);
    rect(c, 1, 2, 6, 12, NES.skyLight);
    rect(c, 9, 2, 6, 12, NES.skyLight);
    rect(c, 2, 3, 1, 4, NES.white);
    rect(c, 10, 3, 1, 4, NES.white);
  }, { doorway: true }),
  /** A wide open door between the store and the garden or auto center. */
  storeDoor: floor(NES.white, (c) => {
    storeTiles(c);
    rect(c, 0, 6, 16, 4, NES.gold);
    rect(c, 0, 7, 16, 2, NES.ochre);
  }, { doorway: true }),
  /** A shelf full of goods (the walls between departments). */
  shelf: solid(NES.gray, shelf),
  /** A gap in the shelves, so you can walk between departments. */
  shelfGap: floor(NES.white, storeTiles, { doorway: true }),
  freezer: solid(NES.blueMid, freezer),

  // ---------- Floors (the aisles, then one per department) ----------
  aisle: floor(NES.white, storeTiles),
  toolsFloor: floor(NES.orangeLight, (c) => {
    fill(c, NES.grayLight);
    speckle(c, NES.gray, 5, 239);
    speckle(c, NES.orangeLight, 2, 240);
  }),
  sportsFloor: floor(NES.greenBright, (c) => {
    fill(c, NES.greenBright);
    speckle(c, NES.green, 8, 241);
    speckle(c, NES.limeLight, 3, 242);
  }),
  petsFloor: floor(NES.pastelBlue, (c) => {
    grid(c, NES.pastelBlue, NES.periwinkle, 8);
    // A little paw print on some tiles.
    if ((c.x + c.y * 2) % 5 === 0) {
      rect(c, 6, 9, 4, 3, NES.periwinkle);
      for (const x of [5, 7, 9]) rect(c, x, 6, 1, 2, NES.periwinkle);
    }
  }),
  produceFloor: floor(NES.mint, (c) => {
    checker(c, NES.mint, NES.white, 8);
    speckle(c, NES.seafoam, 2, 243);
  }),
  bakeryFloor: floor(NES.yellowLight, (c) => {
    checker(c, NES.yellowLight, NES.sand, 4);
  }),
  frozenFloor: floor(NES.skyLight, (c) => {
    grid(c, NES.skyLight, NES.white, 8);
    speckle(c, NES.white, 4, 244);
  }),
};
