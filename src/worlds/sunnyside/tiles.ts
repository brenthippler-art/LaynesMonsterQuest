import { hash2 } from '../../core/rng';
import { NES } from '../../render/nesPalette';
import { checker, fill, grid, planks, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';

/**
 * Sunnyside's tiles, painted in code (16x16 each). A one-story brick school:
 * red brick walls with a cream front, blue lockers and kids' drawings along the
 * hallway, a sun-face sign by the front doors, a fenced playground out back and
 * a bus loop out front. Walls are dark on the corner map so the rooms look outlined.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void): TileKind => ({ walkable: false, color, draw });

/** Does the front of this wall show? (Only when the square below it is something else.) */
const faceShows = (c: TileCtx) => c.near(0, 1) !== c.near(0, 0);

/** Red bricks on top (thin pale lines between them), a cream front where the front shows. */
const brickWall = (c: TileCtx) => {
  wall(c, NES.red, NES.sand, NES.black);
  const bottom = faceShows(c) ? 9 : 15;
  for (let row = 0; row * 4 + 1 < bottom; row++) {
    const top = row * 4 + 1;
    const y = row * 4 + 3;
    if (y < bottom) rect(c, 1, y, 14, 1, NES.salmon);
    // The joints between bricks move over every other row, like a real brick wall.
    const joint = (row + c.x) % 2 ? 4 : 12;
    rect(c, joint, top, 1, Math.min(2, bottom - top), NES.salmon);
  }
};

const grass = (c: TileCtx) => {
  fill(c, NES.greenBright);
  speckle(c, NES.green, 6, 140);
  speckle(c, NES.limeLight, 3, 141);
};
const asphalt = (c: TileCtx) => {
  fill(c, NES.gray);
  speckle(c, NES.grayLight, 5, 142);
  speckle(c, NES.black, 3, 143);
};
/** The hallway's shiny squares: cream and white, like a real school floor. */
const hallTiles = (c: TileCtx) => {
  checker(c, NES.white, NES.sand, 8);
  speckle(c, NES.grayLight, 3, 144);
};

/** Sunnyside's own sign: a smiling sun face (drawn here, so it's nobody else's logo). */
const SUN = [
  'o...oo...o',
  '.o.YYYY.o.',
  '..YYYYYY..',
  '.YYkYYkYY.',
  'oYYYYYYYYo',
  'oYpYYYYpYo',
  '.YYkYYkYY.',
  '..YYkkYY..',
  '.o.YYYY.o.',
  'o...oo...o',
];
const SUN_COLORS: Record<string, string> = { o: NES.orange, Y: NES.gold, k: NES.black, p: NES.pink };
export const drawSunFace = (c: TileCtx, x: number, y: number) => {
  SUN.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '.') rect(c, x + dx, y + dy, 1, 1, SUN_COLORS[row[dx]]);
  });
};

/** A kid's crayon drawing taped to the wall: a little house, a flower or a smiley, picked by the tile's spot. */
const CRAYON = [NES.redBright, NES.blueMid, NES.green, NES.purple, NES.orange, NES.pink];
const kidsDrawing = (c: TileCtx) => {
  rect(c, 3, 9, 10, 6, NES.white);
  rect(c, 7, 9, 2, 1, NES.gold); // a strip of tape
  const pick = Math.floor(hash2(c.x, c.y, 145) * 3);
  const ink = CRAYON[Math.floor(hash2(c.y, c.x, 146) * CRAYON.length)];
  if (pick === 0) {
    rect(c, 5, 12, 4, 3, ink); // a house with a roof
    rect(c, 6, 11, 2, 1, ink);
    rect(c, 10, 10, 2, 2, NES.gold); // and a sun
  } else if (pick === 1) {
    rect(c, 7, 12, 1, 3, NES.green); // a flower
    rect(c, 6, 10, 3, 2, ink);
  } else {
    rect(c, 5, 10, 6, 4, NES.gold); // a smiley
    rect(c, 6, 11, 1, 1, NES.black);
    rect(c, 9, 11, 1, 1, NES.black);
    rect(c, 6, 13, 4, 1, NES.black);
  }
};

/** A row of four blue lockers with little vents and handles. */
const lockerFront = (c: TileCtx) => {
  for (let k = 0; k < 4; k++) {
    rect(c, k * 4, 9, 4, 7, NES.blueMid);
    rect(c, k * 4, 9, 1, 7, NES.blueDark);
    rect(c, k * 4 + 1, 10, 2, 1, NES.sky);
    rect(c, k * 4 + 1, 11, 2, 1, NES.sky);
    rect(c, k * 4 + 2, 13, 1, 1, NES.grayLight);
  }
};

/** Wooden sandbox edges wherever the sand meets something else. */
const sandbox = (c: TileCtx) => {
  fill(c, NES.sand);
  speckle(c, NES.yellowLight, 5, 147);
  speckle(c, NES.orangeLight, 2, 148);
  const edge = (dx: number, dy: number) => c.near(dx, dy) !== 'sandbox';
  if (edge(0, -1)) rect(c, 0, 0, 16, 2, NES.ochre);
  if (edge(0, 1)) rect(c, 0, 14, 16, 2, NES.ochre);
  if (edge(-1, 0)) rect(c, 0, 0, 2, 16, NES.ochre);
  if (edge(1, 0)) rect(c, 14, 0, 2, 16, NES.ochre);
};

/** The gym's wooden floor: a red line just inside the walls, like the edge of a court. */
const gymWood = (c: TileCtx) => {
  planks(c, NES.orangeLight, NES.ochre, NES.yellowLight);
  const edge = (dx: number, dy: number) => !c.near(dx, dy).startsWith('gym');
  if (edge(0, -1)) rect(c, 0, 2, 16, 1, NES.redBright);
  if (edge(0, 1)) rect(c, 0, 13, 16, 1, NES.redBright);
  if (edge(-1, 0)) rect(c, 2, 0, 1, 16, NES.redBright);
  if (edge(1, 0)) rect(c, 13, 0, 1, 16, NES.redBright);
};

/** Glass doors (front and back of the school): two panes with a gap down the middle. */
const glassDoors = (c: TileCtx) => {
  hallTiles(c);
  rect(c, 0, 1, 16, 14, NES.blueMid);
  rect(c, 1, 2, 6, 12, NES.skyLight);
  rect(c, 9, 2, 6, 12, NES.skyLight);
  rect(c, 2, 3, 1, 4, NES.white);
  rect(c, 10, 3, 1, 4, NES.white);
  rect(c, 6, 8, 1, 2, NES.gray);
  rect(c, 9, 8, 1, 2, NES.gray);
};

export const SUNNYSIDE_TILES: Record<string, TileKind> = {
  // ---------- Outside ----------
  hedge: solid(NES.greenDark, (c) => {
    fill(c, NES.greenForest);
    speckle(c, NES.green, 10, 149);
    speckle(c, NES.greenDark, 6, 150);
  }),
  /** The playground's chain-link fence: gray posts with a crisscross wire. */
  fence: solid(NES.gray, (c) => {
    grass(c);
    for (let y = 3; y < 15; y++) {
      for (let x = 0; x < 16; x++) if ((x + y) % 4 === 0 || (x - y + 16) % 4 === 0) rect(c, x, y, 1, 1, NES.grayLight);
    }
    rect(c, 0, 2, 16, 1, NES.gray);
    rect(c, 7, 2, 2, 13, NES.gray);
  }),
  grass: floor(NES.greenBright, grass),
  /** Soft wood chips under the swings, slide and monkey bars. */
  woodchips: floor(NES.ochre, (c) => {
    fill(c, NES.ochre);
    speckle(c, NES.orangeLight, 8, 151);
    speckle(c, NES.brownRed, 5, 152);
  }),
  sandbox: floor(NES.sand, sandbox),
  /** The playground's blacktop, for hopscotch and chalk. */
  blacktop: floor(NES.gray, (c) => {
    asphalt(c);
    speckle(c, NES.pinkLight, 1, 153);
  }),
  /** A chalk hopscotch square, with 1 to 5 chalk dots to count (they change as you hop up the column). */
  hopscotch: floor(NES.gray, (c) => {
    asphalt(c);
    rect(c, 2, 1, 12, 1, NES.white);
    rect(c, 2, 14, 12, 1, NES.white);
    rect(c, 2, 1, 1, 14, NES.white);
    rect(c, 13, 1, 1, 14, NES.white);
    const dots = (c.y % 5) + 1;
    for (let k = 0; k < dots; k++) rect(c, 4 + k * 2, 7, 1, 2, k % 2 ? NES.pinkLight : NES.yellowLight);
  }),
  sidewalk: floor(NES.grayLight, (c) => {
    grid(c, NES.grayLight, NES.gray, 8);
    speckle(c, NES.white, 3, 154);
  }),
  road: floor(NES.gray, asphalt),
  /** Yellow dashes down the middle of the bus loop. */
  roadLine: floor(NES.gray, (c) => {
    asphalt(c);
    rect(c, 2, 7, 8, 2, NES.gold);
  }),
  /** Wide white crosswalk stripes. */
  crosswalk: floor(NES.white, (c) => {
    asphalt(c);
    for (const x of [1, 6, 11]) rect(c, x, 0, 4, 16, NES.white);
  }),

  // ---------- Walls, windows and doors ----------
  wall: solid(NES.brownRed, brickWall),
  window: solid(NES.brownRed, (c) => {
    brickWall(c);
    rect(c, 2, 2, 12, 9, NES.white);
    rect(c, 3, 3, 10, 7, NES.skyLight);
    rect(c, 7, 3, 2, 7, NES.white);
    rect(c, 4, 4, 1, 2, NES.white);
  }),
  /** The school's sign by the front doors: a smiling sun on a sky-blue board. */
  sunSign: solid(NES.brownRed, (c) => {
    brickWall(c);
    rect(c, 1, 0, 14, 12, NES.black);
    rect(c, 2, 1, 12, 10, NES.skyLight);
    drawSunFace(c, 3, 1);
  }),
  /** Hallway wall with blue lockers on its front. */
  lockers: solid(NES.brownRed, (c) => {
    brickWall(c);
    if (faceShows(c)) lockerFront(c);
  }),
  /** Hallway wall with a kid's drawing taped to its front. */
  artWall: solid(NES.brownRed, (c) => {
    brickWall(c);
    if (faceShows(c)) kidsDrawing(c);
  }),
  frontDoor: floor(NES.skyLight, glassDoors, { doorway: true }),
  /** An open classroom door: hallway floor with a wooden threshold strip. */
  doorway: floor(NES.white, (c) => {
    hallTiles(c);
    rect(c, 0, 7, 16, 2, NES.ochre);
  }, { doorway: true }),

  // ---------- Floors (the hallway, then one per room) ----------
  hallFloor: floor(NES.white, hallTiles),
  classFloor: floor(NES.sand, (c) => {
    grid(c, NES.sand, NES.orangeLight, 8);
    speckle(c, NES.white, 2, 155);
  }),
  libraryFloor: floor(NES.periwinkle, (c) => {
    fill(c, NES.periwinkle);
    speckle(c, NES.pastelBlue, 6, 156);
    speckle(c, NES.blueMid, 4, 157);
  }),
  lunchFloor: floor(NES.yellowLight, (c) => checker(c, NES.yellowLight, NES.white, 8)),
  gymFloor: floor(NES.orangeLight, gymWood),
  /** The middle line of the basketball court. */
  gymLine: floor(NES.orangeLight, (c) => {
    gymWood(c);
    rect(c, 7, 0, 2, 16, NES.blueMid);
  }),
  artFloor: floor(NES.pinkLight, (c) => {
    fill(c, NES.white);
    speckle(c, NES.grayLight, 4, 158);
    speckle(c, NES.pink, 2, 159);
    speckle(c, NES.sky, 2, 160);
    speckle(c, NES.gold, 2, 161);
  }),
  musicFloor: floor(NES.violet, (c) => {
    fill(c, NES.violet);
    speckle(c, NES.lavender, 6, 162);
    speckle(c, NES.purple, 4, 163);
  }),
  scienceFloor: floor(NES.mint, (c) => {
    grid(c, NES.mint, NES.seafoam, 8);
    speckle(c, NES.white, 3, 164);
  }),
};
