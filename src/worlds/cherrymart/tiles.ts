import { hash2 } from '../../core/rng';
import { NES } from '../../render/nesPalette';
import { checker, fill, grid, planks, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';

/**
 * Cherry Mart's tiles, painted in code (16x16 each). The store is red and white:
 * red-topped walls with a white front and a red stripe, a wide red racetrack
 * aisle, and tall shelves between the departments. Walls and shelves are dark
 * on the corner map so the departments look outlined.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void): TileKind => ({ walkable: false, color, draw });

/** Red on top, a white front with a red stripe (only where the front shows). */
const storeWall = (c: TileCtx) => {
  wall(c, NES.red, NES.white, NES.black);
  if (c.near(0, 1) !== c.near(0, 0)) rect(c, 0, 12, 16, 2, NES.redBright);
};
const asphalt = (c: TileCtx) => {
  fill(c, NES.gray);
  speckle(c, NES.grayLight, 5, 120);
  speckle(c, NES.black, 3, 121);
};
/** Shiny white store tiles (the deals area and the doorways). */
const whiteTiles = (c: TileCtx) => {
  grid(c, NES.white, NES.grayLight, 8);
  speckle(c, NES.skyLight, 2, 122);
};

/** Cherry Mart's own sign: two red cherries on green stems (no letters, no logo of any real store). */
const CHERRIES = [
  '....gGG...',
  '....g.....',
  '...g.g....',
  '..g...g...',
  '.g.....g..',
  'rrr...rrr.',
  'rwrr..rwrr',
  'rrrr..rrrr',
  '.RR....RR.',
];
const CHERRY_COLORS: Record<string, string> = { g: NES.green, G: NES.greenForest, r: NES.redBright, R: NES.red, w: NES.white };
const twoCherries = (c: TileCtx, x: number, y: number) => {
  CHERRIES.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '.') rect(c, x + dx, y + dy, 1, 1, CHERRY_COLORS[row[dx]]);
  });
};

/** Colorful boxes on a store shelf: each box's color is picked from the tile's spot, so it never changes. */
const BOX_COLORS = [NES.redBright, NES.sky, NES.gold, NES.greenBright, NES.pink, NES.orange, NES.lavender, NES.white];
const productBoxes = (c: TileCtx, y: number, salt: number) => {
  for (let k = 0; k < 4; k++) {
    const color = BOX_COLORS[Math.floor(hash2(c.x * 4 + k, c.y, salt) * BOX_COLORS.length)];
    rect(c, k * 4 + 1, y, 3, 4, color);
  }
};

export const CHERRYMART_TILES: Record<string, TileKind> = {
  // ---------- Outside ----------
  hedge: solid(NES.greenDark, (c) => {
    fill(c, NES.greenForest);
    speckle(c, NES.green, 10, 123);
    speckle(c, NES.greenDark, 6, 124);
  }),
  lot: floor(NES.gray, asphalt),
  lotStripe: floor(NES.gray, (c) => {
    asphalt(c);
    rect(c, 7, 0, 2, 16, NES.white);
  }),
  sidewalk: floor(NES.grayLight, (c) => {
    grid(c, NES.grayLight, NES.gray, 8);
    speckle(c, NES.white, 3, 125);
  }),

  // ---------- Walls, shelves and doors ----------
  wall: solid(NES.brownRed, storeWall),
  window: solid(NES.brownRed, (c) => {
    storeWall(c);
    rect(c, 2, 2, 12, 9, NES.white);
    rect(c, 3, 3, 10, 7, NES.skyLight);
    rect(c, 4, 4, 1, 2, NES.white);
    rect(c, 5, 4, 1, 1, NES.white);
  }),
  /** The store's own sign on the front wall: two cherries on a white circle-ish board. */
  signWall: solid(NES.brownRed, (c) => {
    storeWall(c);
    rect(c, 1, 0, 14, 12, NES.black);
    rect(c, 2, 1, 12, 10, NES.white);
    twoCherries(c, 3, 2);
  }),
  /** Glass sliding doors: two panes with a gap down the middle. */
  slideDoor: floor(NES.skyLight, (c) => {
    whiteTiles(c);
    rect(c, 0, 1, 16, 14, NES.gray);
    rect(c, 1, 2, 6, 12, NES.skyLight);
    rect(c, 9, 2, 6, 12, NES.skyLight);
    rect(c, 2, 3, 1, 4, NES.white);
    rect(c, 10, 3, 1, 4, NES.white);
  }, { doorway: true }),
  /** The tall shelves between departments, seen from above, with boxes on the front. */
  shelf: solid(NES.gray, (c) => {
    fill(c, NES.grayLight);
    rect(c, 0, 0, 16, 1, NES.gray);
    if (c.near(0, 1) !== c.near(0, 0)) {
      rect(c, 0, 6, 16, 10, NES.white);
      productBoxes(c, 7, 126);
      rect(c, 0, 11, 16, 1, NES.gray);
      productBoxes(c, 12, 127);
    } else {
      productBoxes(c, 3, 128);
      productBoxes(c, 9, 129);
    }
    rect(c, 0, 15, 16, 1, NES.gray);
  }),
  doorway: floor(NES.white, whiteTiles, { doorway: true }),

  // ---------- The red racetrack aisle ----------
  /** Red floor with a white line along each edge, so it looks like a racetrack around the store. */
  aisle: floor(NES.redBright, (c) => {
    fill(c, NES.redBright);
    speckle(c, NES.salmon, 3, 130);
    const edge = (dx: number, dy: number) => c.near(dx, dy) !== 'aisle';
    if (edge(0, -1)) rect(c, 0, 1, 16, 2, NES.white);
    if (edge(0, 1)) rect(c, 0, 13, 16, 2, NES.white);
    if (edge(-1, 0)) rect(c, 1, 0, 2, 16, NES.white);
    if (edge(1, 0)) rect(c, 13, 0, 2, 16, NES.white);
  }),

  // ---------- Floors (one per department) ----------
  dealsFloor: floor(NES.white, whiteTiles),
  toysFloor: floor(NES.sky, (c) => {
    grid(c, NES.skyLight, NES.sky, 8);
    const dots = [NES.gold, NES.pink, NES.greenBright, NES.redBright];
    rect(c, 3, 3, 2, 2, dots[(c.x + c.y) % 4]);
    rect(c, 11, 11, 2, 2, dots[(c.x + c.y + 2) % 4]);
  }),
  homeFloor: floor(NES.ochre, (c) => planks(c, NES.orangeLight, NES.ochre, NES.yellowLight)),
  clothesFloor: floor(NES.lavender, (c) => {
    fill(c, NES.lavender);
    speckle(c, NES.pastelBlue, 6, 131);
    speckle(c, NES.white, 3, 132);
  }),
  techFloor: floor(NES.blue, (c) => {
    grid(c, NES.blueMid, NES.sky, 8);
    speckle(c, NES.cyan, 2, 133);
  }),
  cafeFloor: floor(NES.redBright, (c) => checker(c, NES.white, NES.redBright, 8)),
  groceryFloor: floor(NES.mint, (c) => {
    grid(c, NES.mint, NES.seafoam, 8);
    speckle(c, NES.white, 3, 134);
  }),
  beautyFloor: floor(NES.pinkLight, (c) => {
    grid(c, NES.pinkLight, NES.pink, 8);
    speckle(c, NES.white, 4, 135);
  }),
  holidayFloor: floor(NES.gold, (c) => {
    grid(c, NES.yellowLight, NES.gold, 8);
    speckle(c, NES.white, 3, 136);
  }),
};
