import { NES } from '../../render/nesPalette';
import { checker, fill, grid, planks, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';

/**
 * The Zoo's tiles, painted in code (16x16 each). An outdoor zoo: warm paths with
 * paw prints, wooden rail fences around each area, and a different ground in every
 * area so you can tell them apart (golden grass, jungle leaves, snow, sand...).
 *
 * Ponds, pools and the desert canyon are "hop" squares (see `hops` in index.ts):
 * Layne can't walk on them, but he can JUMP over one. The rocks in the middle of
 * them (sunRock, mossIsle, iceFloe, mesa, duckIsle, nestIsle, sealRock) are walkable
 * and set their own `height3d`, so in 3D Layne stands up on top of them.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: false, color, draw, ...extra });

/** Grass (or snow, or sand) with a few lighter and darker specks. */
const ground = (c: TileCtx, base: string, light: string, dark: string, salt: number) => {
  fill(c, base);
  speckle(c, light, 6, salt);
  speckle(c, dark, 4, salt + 1);
};

/** Water with little white sparkles, and a darker edge along the bank. */
const water = (c: TileCtx, base: string, sparkle: string, edge: string, salt: number) => {
  fill(c, base);
  speckle(c, sparkle, 4, salt);
  if ((c.x * 3 + c.y) % 4 === 0) rect(c, 4, 8, 5, 1, sparkle);
  const same = c.near(0, 0);
  if (c.near(0, -1) !== same) rect(c, 0, 0, 16, 2, edge);
  if (c.near(-1, 0) !== same) rect(c, 0, 0, 2, 16, edge);
};

/** A rock or island top: its ground, with a darker rim where it drops into the water. */
const isle = (c: TileCtx, base: string, light: string, rim: string, salt: number) => {
  ground(c, base, light, rim, salt);
  const same = (dx: number, dy: number) => c.near(dx, dy) === c.near(0, 0);
  if (!same(0, 1)) rect(c, 0, 14, 16, 2, rim);
  if (!same(0, -1)) rect(c, 0, 0, 16, 1, rim);
  if (!same(-1, 0)) rect(c, 0, 0, 1, 16, rim);
  if (!same(1, 0)) rect(c, 15, 0, 1, 16, rim);
};

/** The zoo's paths: sandy paving with a little paw print here and there. */
const paving = (c: TileCtx) => {
  grid(c, NES.sand, NES.yellowLight, 8);
  speckle(c, NES.skin, 2, 400);
  if ((c.x * 5 + c.y * 3) % 11 === 0) {
    rect(c, 6, 8, 4, 3, NES.ochre); // the pad
    for (const [x, y] of [[5, 6], [7, 5], [9, 5], [11, 6]]) rect(c, x, y, 1, 1, NES.ochre); // four toes
  }
};

/** A wooden rail fence standing on grass. */
const railFence = (c: TileCtx) => {
  ground(c, NES.greenBright, NES.limeLight, NES.green, 402);
  rect(c, 0, 5, 16, 2, NES.orange);
  rect(c, 0, 10, 16, 2, NES.orange);
  for (const x of [2, 10]) {
    rect(c, x, 2, 3, 13, NES.brownRed);
    rect(c, x, 2, 3, 1, NES.ochre);
  }
};

export const ZOO_TILES: Record<string, TileKind> = {
  // ---------- All over the zoo ----------
  hedge: solid(NES.greenDark, (c) => {
    fill(c, NES.greenForest);
    speckle(c, NES.green, 10, 404);
    speckle(c, NES.greenDark, 6, 405);
    if ((c.x * 7 + c.y * 5) % 9 === 0) rect(c, 6, 6, 2, 2, NES.gold); // a few yellow flowers in the hedge
  }),
  path: floor(NES.sand, paving),
  /** An opening in a fence: path stones with a post on each side. */
  gap: floor(NES.sand, (c) => {
    paving(c);
    const post = (n: string) => n === 'fence' || n === 'netFence';
    if (post(c.near(-1, 0))) rect(c, 0, 2, 2, 12, NES.brownRed);
    if (post(c.near(1, 0))) rect(c, 14, 2, 2, 12, NES.brownRed);
    if (post(c.near(0, -1))) rect(c, 2, 0, 12, 2, NES.brownRed);
    if (post(c.near(0, 1))) rect(c, 2, 14, 12, 2, NES.brownRed);
  }, { doorway: true }),
  fence: solid(NES.brownRed, railFence),
  /** A bed of flowers in every color (you can't walk on the flowers!). */
  flowerBed: solid(NES.pink, (c) => {
    fill(c, NES.brownRed);
    speckle(c, NES.brownDark, 5, 408);
    const colors = [NES.pink, NES.gold, NES.redBright, NES.lavender, NES.white];
    for (let k = 0; k < 5; k++) {
      const x = 1 + ((k * 5 + c.x * 3) % 12);
      const y = 1 + ((k * 7 + c.y * 5) % 12);
      rect(c, x, y + 1, 1, 2, NES.green);
      rect(c, x - 1, y, 3, 1, colors[(k + c.x + c.y) % colors.length]);
      rect(c, x, y - 1, 1, 3, colors[(k + c.x + c.y) % colors.length]);
    }
  }),

  // ---------- GATE: the front wall, the sign, the gift shops ----------
  gatePlaza: floor(NES.salmon, (c) => {
    fill(c, NES.orangeLight);
    for (let y = 3; y < 16; y += 4) rect(c, 0, y, 16, 1, NES.salmon); // rows of warm bricks
    for (let row = 0; row < 4; row++) rect(c, (row % 2) * 8 + 4, row * 4, 1, 3, NES.salmon);
  }),
  /** The front wall: big stone blocks with a green stripe of ivy on top. */
  gateWall: solid(NES.gray, (c) => {
    wall(c, NES.grayLight, NES.gray, NES.black);
    for (let row = 0; row < 4; row++) rect(c, (row % 2) * 8 + 3, row * 4 + 1, 1, 3, NES.gray);
    rect(c, 0, 0, 16, 2, NES.green);
    if ((c.x + c.y) % 3 === 0) rect(c, 5, 2, 2, 3, NES.greenBright); // ivy hanging down
  }),
  /** The big sign over the front gate: a jungle-green board with a giant paw print on every square. */
  signBoard: solid(NES.green, (c) => {
    fill(c, NES.greenForest);
    rect(c, 0, 0, 16, 1, NES.gold);
    rect(c, 0, 15, 16, 1, NES.gold);
    if (c.near(-1, 0) !== 'signBoard') rect(c, 0, 0, 1, 16, NES.gold);
    if (c.near(1, 0) !== 'signBoard') rect(c, 15, 0, 1, 16, NES.gold);
    rect(c, 5, 8, 6, 5, NES.yellowLight); // the pad
    rect(c, 6, 7, 4, 1, NES.yellowLight);
    for (const [x, y] of [[3, 5], [6, 3], [9, 3], [12, 5]]) rect(c, x, y, 2, 2, NES.yellowLight); // toes
  }),
  /** The gift shops and snack huts, seen from above: thatched straw roofs. */
  shopRoof: solid(NES.gold, (c) => {
    fill(c, NES.gold);
    for (let y = 1; y < 16; y += 3) for (let x = (y % 2) * 2; x < 16; x += 4) rect(c, x, y, 2, 1, NES.ochre);
    if (c.near(0, 1) !== 'shopRoof') {
      for (let x = 0; x < 16; x += 4) rect(c, x + 1, 13, 2, 3, NES.ochre); // the straw fringe
      rect(c, 0, 15, 16, 1, NES.brownDark);
    }
  }),

  // ---------- SAFARI ----------
  savannaGrass: floor(NES.yellowLight, (c) => {
    ground(c, NES.yellowLight, NES.sand, NES.gold, 410);
    if ((c.x * 3 + c.y * 7) % 5 === 0) for (const x of [4, 6, 8]) rect(c, x, 9 - (x % 4), 1, 4, NES.ochre); // a tuft of dry grass
  }),
  /** The watering hole: muddy-blue water. */
  savannaPond: solid(NES.sky, (c) => water(c, NES.sky, NES.skyLight, NES.ochre, 412)),
  /** A warm, flat rock in the watering hole: hop onto it! */
  sunRock: floor(NES.grayLight, (c) => isle(c, NES.grayLight, NES.white, NES.gray, 414), { height3d: 0.45 }),

  // ---------- JUNGLE ----------
  jungleFloor: floor(NES.green, (c) => {
    ground(c, NES.green, NES.greenBright, NES.greenForest, 416);
    if ((c.x + c.y * 2) % 4 === 0) {
      rect(c, 3, 4, 5, 2, NES.greenForest); // a big fallen leaf
      rect(c, 4, 6, 3, 1, NES.greenForest);
    }
  }),
  jungleRiver: solid(NES.teal, (c) => water(c, NES.teal, NES.cyan, NES.greenForest, 418)),
  /** A soft mossy island in the jungle lake. */
  mossIsle: floor(NES.greenSea, (c) => isle(c, NES.greenSea, NES.seafoam, NES.greenForest, 420), { height3d: 0.3 }),

  // ---------- POLAR ----------
  snow: floor(NES.white, (c) => ground(c, NES.white, NES.skyLight, NES.grayLight, 422)),
  /** Slippery blue ice (it's only slippery for pretend!). */
  ice: floor(NES.skyLight, (c) => {
    fill(c, NES.skyLight);
    rect(c, 2, 3, 4, 1, NES.white); // shiny scratches
    rect(c, 9, 10, 5, 1, NES.white);
    speckle(c, NES.white, 2, 424);
  }),
  penguinPool: solid(NES.blueMid, (c) => water(c, NES.blueMid, NES.skyLight, NES.white, 426)),
  /** A floating block of ice in the penguin pool. */
  iceFloe: floor(NES.white, (c) => isle(c, NES.white, NES.skyLight, NES.sky, 428), { height3d: 0.15 }),

  // ---------- DESERT ----------
  sand: floor(NES.sand, (c) => {
    ground(c, NES.sand, NES.yellowLight, NES.orangeLight, 430);
    if ((c.y * 3 + c.x) % 6 === 0) rect(c, 2, 8, 12, 1, NES.orangeLight); // little ripples in the sand
  }),
  /** A deep crack in the ground, just one square wide: jump across it! */
  canyon: solid(NES.brownRed, (c) => {
    fill(c, NES.brownRed);
    speckle(c, NES.brownDark, 8, 432);
    rect(c, 5, 6, 6, 4, NES.brownDark);
  }, { height3d: -0.6 }),
  /** The top of the big flat rock in the middle of the canyon. */
  mesa: floor(NES.orange, (c) => isle(c, NES.orangeLight, NES.sand, NES.orange, 434), { height3d: 0.8 }),

  // ---------- FARM ----------
  farmGrass: floor(NES.greenBright, (c) => {
    ground(c, NES.greenBright, NES.limeLight, NES.green, 436);
    if ((c.x * 5 + c.y * 3) % 13 === 0) rect(c, 7, 7, 2, 2, NES.white); // a daisy
  }),
  duckPond: solid(NES.sky, (c) => water(c, NES.sky, NES.white, NES.green, 438)),
  /** A little grassy island in the duck pond. */
  duckIsle: floor(NES.lime, (c) => isle(c, NES.lime, NES.limeLight, NES.green, 440), { height3d: 0.2 }),

  // ---------- BIRDS (the aviary) ----------
  aviaryGrass: floor(NES.seafoam, (c) => ground(c, NES.seafoam, NES.mint, NES.greenSea, 442)),
  /** The aviary's tall net: a fine black mesh on poles, so the birds stay safe inside. */
  netFence: solid(NES.gray, (c) => {
    fill(c, NES.mint);
    for (let i = 0; i < 16; i += 3) {
      rect(c, i, 0, 1, 16, NES.gray);
      rect(c, 0, i, 16, 1, NES.gray);
    }
    rect(c, 6, 0, 3, 16, NES.brownDark); // a pole
  }),
  birdPond: solid(NES.sky, (c) => water(c, NES.sky, NES.skyLight, NES.greenSea, 444)),
  /** The nesting island in the bird pond. */
  nestIsle: floor(NES.ochre, (c) => isle(c, NES.yellowLight, NES.sand, NES.ochre, 446), { height3d: 0.2 }),

  // ---------- REPTILES (the reptile house) ----------
  reptileWall: solid(NES.brownRed, (c) => wall(c, NES.orange, NES.brownRed, NES.brownDark)),
  /** Warm stone floor: reptiles love a cozy floor. */
  reptileFloor: floor(NES.orangeLight, (c) => {
    grid(c, NES.orangeLight, NES.ochre, 8);
    speckle(c, NES.sand, 3, 448);
  }),
  /** A glass tank with leafy plants inside (built into the wall, or standing in the room). */
  glassTank: solid(NES.mint, (c) => {
    fill(c, NES.mint);
    rect(c, 0, 12, 16, 4, NES.sand); // sand in the bottom
    rect(c, 3, 5, 2, 7, NES.green); // plants
    rect(c, 11, 7, 2, 5, NES.greenBright);
    rect(c, 2, 2, 1, 4, NES.white); // a shine on the glass
    if (c.near(0, -1) !== 'glassTank') rect(c, 0, 0, 16, 1, NES.gray);
    if (c.near(-1, 0) !== 'glassTank') rect(c, 0, 0, 1, 16, NES.gray);
    if (c.near(1, 0) !== 'glassTank') rect(c, 15, 0, 1, 16, NES.gray);
  }),
  /** The reptile house's open doorway: a woven mat. */
  reptileDoor: floor(NES.ochre, (c) => checker(c, NES.ochre, NES.orange, 4), { doorway: true }),

  // ---------- AQUARIUM (outside: the sea-lion pool; inside: its own map) ----------
  /** The boardwalk around the sea-lion pool. */
  boardwalk: floor(NES.orangeLight, (c) => planks(c, NES.orangeLight, NES.ochre, NES.sand)),
  /** The aquarium building: blue walls with round porthole windows. */
  aquaWall: solid(NES.blue, (c) => {
    wall(c, NES.periwinkle, NES.blue, NES.blueDark);
    if (c.near(0, 1) !== 'aquaWall' && c.near(0, 1) !== 'aquaDoor' && c.x % 3 === 0) {
      rect(c, 5, 10, 6, 5, NES.skyLight); // a porthole
      rect(c, 6, 11, 2, 2, NES.white);
    }
  }),
  /** The aquarium's front door (inside is its own map). */
  aquaDoor: floor(NES.blueDark, (c) => {
    fill(c, NES.periwinkle);
    rect(c, 2, 2, 12, 14, NES.blueDark);
    rect(c, 3, 1, 10, 1, NES.gold);
    rect(c, 6, 6, 4, 3, NES.sky); // a little fish on the door
    rect(c, 10, 5, 2, 5, NES.sky);
  }, { doorway: true }),
  sealPool: solid(NES.blueMid, (c) => water(c, NES.blueMid, NES.white, NES.gray, 450)),
  /** The big rock the sea lions sunbathe on. */
  sealRock: floor(NES.gray, (c) => isle(c, NES.gray, NES.grayLight, NES.black, 452), { height3d: 0.4 }),
  /** Inside the aquarium: deep blue carpet with little bubbles. */
  aquaFloor: floor(NES.blue, (c) => {
    fill(c, NES.blue);
    speckle(c, NES.blueMid, 6, 454);
    if ((c.x + c.y * 3) % 5 === 0) rect(c, 7, 7, 2, 2, NES.sky); // a bubble
  }),
  /** A huge fish tank, floor to ceiling: water, seaweed, and a little fish swimming by. */
  bigTank: solid(NES.sky, (c) => {
    fill(c, NES.sky);
    rect(c, 0, 13, 16, 3, NES.sand);
    rect(c, 2 + ((c.x * 5) % 9), 4 + ((c.y * 3) % 5), 4, 3, [NES.orange, NES.gold, NES.pink][(c.x + c.y) % 3]); // a fish
    rect(c, 13, 6, 2, 7, NES.greenSea); // seaweed
    rect(c, 1, 1, 1, 3, NES.white); // a shine on the glass
  }),
  /** The glass tunnel's floor: you walk right under the fish! */
  tunnelFloor: floor(NES.skyLight, (c) => {
    fill(c, NES.skyLight);
    rect(c, 0, 0, 16, 1, NES.white);
    rect(c, 0, 8, 16, 1, NES.white);
    if ((c.x * 3) % 7 === 0) rect(c, 5, 3, 5, 3, NES.gold); // a fish shadow
  }),
  /** The touch pool: shallow water with starfish to look at. */
  touchPool: solid(NES.cyan, (c) => {
    water(c, NES.cyan, NES.white, NES.teal, 456);
    if ((c.x + c.y) % 3 === 0) {
      rect(c, 7, 5, 2, 6, NES.salmon); // a starfish
      rect(c, 5, 7, 6, 2, NES.salmon);
    }
  }),
  /** The way back out of the aquarium. */
  aquaExit: floor(NES.gold, (c) => {
    fill(c, NES.gold);
    rect(c, 3, 3, 10, 10, NES.yellowLight);
    rect(c, 7, 5, 2, 7, NES.orange); // a little arrow pointing out
    rect(c, 5, 9, 6, 2, NES.orange);
    rect(c, 6, 11, 4, 1, NES.orange);
  }, { doorway: true }),
};
