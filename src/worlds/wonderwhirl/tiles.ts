import { NES } from '../../render/nesPalette';
import { checker, fill, grid, planks, rect, speckle, wall } from '../building/paint';
import { type TileCtx, type TileKind } from '../building/types';
import { drawPinwheel } from './pinwheel';

/**
 * Wonderwhirl Park's tiles, painted in code (16x16 each). An outdoor theme park:
 * warm paths, white picket fences and flower beds between the ride areas, and a
 * different ground in every area so you can tell them apart. Fences, hedges and
 * walls are darker on the corner map so the areas look outlined.
 */
const floor = (color: string, draw: (c: TileCtx) => void, extra: Partial<TileKind> = {}): TileKind => ({ walkable: true, color, draw, ...extra });
const solid = (color: string, draw: (c: TileCtx) => void): TileKind => ({ walkable: false, color, draw });

/** Grass with a few lighter and darker blades. */
const grass = (c: TileCtx, base: string, light: string, dark: string, salt: number) => {
  fill(c, base);
  speckle(c, light, 6, salt);
  speckle(c, dark, 4, salt + 1);
};

/** The park's paths: warm pink-and-tan paving stones. */
const paving = (c: TileCtx) => {
  grid(c, NES.sand, NES.yellowLight, 8);
  if ((c.x + c.y) % 2) rect(c, 1, 1, 7, 7, NES.skin);
  speckle(c, NES.salmon, 1, 300);
};

/** A white picket fence standing on grass. */
const picket = (c: TileCtx) => {
  grass(c, NES.greenBright, NES.limeLight, NES.green, 302);
  rect(c, 0, 6, 16, 2, NES.white);
  rect(c, 0, 11, 16, 2, NES.white);
  for (const x of [1, 6, 11]) {
    rect(c, x, 3, 3, 12, NES.white);
    rect(c, x + 1, 2, 1, 1, NES.white);
    rect(c, x + 2, 4, 1, 11, NES.grayLight); // a little shadow on one side
  }
};

/** The park's front wall: red bricks with a gold stripe on top. */
const brick = (c: TileCtx) => {
  wall(c, NES.red, NES.redBright, NES.brownRed);
  for (let row = 0; row < 4; row++) {
    const y = row * 4 + 1;
    for (let x = (row % 2) * 4; x < 16; x += 8) rect(c, x, y, 1, 3, NES.brownRed);
  }
  rect(c, 0, 0, 16, 1, NES.gold);
};

/** Stripes going across, for tents, awnings and the funhouse. */
const stripes = (c: TileCtx, a: string, b: string, width: number) => {
  for (let x = 0; x < 16; x++) rect(c, x, 0, 1, 16, Math.floor((x + c.x * 16) / width) % 2 ? b : a);
};

/** Is the tile next door this kind? (For tracks and rails that join up.) */
const same = (c: TileCtx, dx: number, dy: number) => c.near(dx, dy) === c.near(0, 0);

/** Water with little white sparkles. */
const water = (c: TileCtx, base: string, sparkle: string, salt: number) => {
  fill(c, base);
  speckle(c, sparkle, 4, salt);
  if ((c.x * 3 + c.y) % 4 === 0) rect(c, 4, 8, 5, 1, sparkle);
};

export const WONDERWHIRL_TILES: Record<string, TileKind> = {
  // ---------- All over the park ----------
  hedge: solid(NES.greenDark, (c) => {
    fill(c, NES.greenForest);
    speckle(c, NES.green, 10, 304);
    speckle(c, NES.greenDark, 6, 305);
    if ((c.x * 7 + c.y * 5) % 9 === 0) rect(c, 6, 6, 2, 2, NES.pink); // a few flowers in the hedge
  }),
  lawn: floor(NES.greenBright, (c) => grass(c, NES.greenBright, NES.limeLight, NES.green, 306)),
  path: floor(NES.sand, paving),
  /** An opening in a fence: path stones with a gatepost on each side. */
  gap: floor(NES.sand, (c) => {
    paving(c);
    const across = c.near(-1, 0) === 'fence' || c.near(1, 0) === 'fence';
    if (across) {
      if (c.near(-1, 0) === 'fence') rect(c, 0, 2, 2, 12, NES.white);
      if (c.near(1, 0) === 'fence') rect(c, 14, 2, 2, 12, NES.white);
    } else {
      if (c.near(0, -1) === 'fence') rect(c, 2, 0, 12, 2, NES.white);
      if (c.near(0, 1) === 'fence') rect(c, 2, 14, 12, 2, NES.white);
    }
  }, { doorway: true }),
  fence: solid(NES.white, picket),
  /** A bed of flowers in every color (you can't walk on the flowers!). */
  flowerBed: solid(NES.pink, (c) => {
    fill(c, NES.brownRed);
    speckle(c, NES.brownDark, 5, 308);
    const colors = [NES.pink, NES.gold, NES.redBright, NES.lavender, NES.white];
    for (let k = 0; k < 5; k++) {
      const x = 1 + ((k * 5 + c.x * 3) % 12);
      const y = 1 + ((k * 7 + c.y * 5) % 12);
      rect(c, x, y + 1, 1, 2, NES.green);
      rect(c, x - 1, y, 3, 1, colors[(k + c.x + c.y) % colors.length]);
      rect(c, x, y - 1, 1, 3, colors[(k + c.x + c.y) % colors.length]);
    }
  }),
  /** Gravel under a ride: nobody walks here (the ride is moving!). */
  rideGround: solid(NES.gray, (c) => {
    fill(c, NES.grayLight);
    speckle(c, NES.gray, 8, 310);
    speckle(c, NES.white, 3, 311);
  }),
  daySky: solid(NES.skyLight, (c) => {
    fill(c, NES.skyLight);
    if (c.near(0, 1) !== 'daySky') rect(c, 0, 12, 16, 4, NES.sky); // a soft blue edge where the sky meets the hill
  }),
  nightSky: solid(NES.blueDark, (c) => {
    fill(c, NES.blueDark);
    speckle(c, NES.white, 2, 312);
    speckle(c, NES.periwinkle, 2, 313);
    if (c.near(0, 1) !== 'nightSky') rect(c, 0, 12, 16, 4, NES.purple);
  }),

  // ---------- GATE: the front wall, the sign, main street ----------
  gatePlaza: floor(NES.salmon, (c) => {
    fill(c, NES.salmon);
    for (let y = 3; y < 16; y += 4) rect(c, 0, y, 16, 1, NES.rose); // rows of red bricks
    for (let row = 0; row < 4; row++) rect(c, (row % 2) * 8 + 4, row * 4, 1, 3, NES.rose);
  }),
  gateWall: solid(NES.red, brick),
  /** The big sign over the front gate: a swirly pinwheel on a gold board (the pinwheel spins, see rides/). */
  signBoard: solid(NES.gold, (c) => {
    fill(c, NES.gold);
    rect(c, 0, 0, 16, 1, NES.orange);
    rect(c, 0, 15, 16, 1, NES.orange);
    if (c.near(-1, 0) !== 'signBoard') rect(c, 0, 0, 1, 16, NES.orange);
    if (c.near(1, 0) !== 'signBoard') rect(c, 15, 0, 1, 16, NES.orange);
    // Little swirls on the board, lined up from tile to tile.
    drawPinwheel(c, 8, 8, 5, (c.x + c.y) * 0.7, [NES.pinkLight, NES.yellowLight]);
  }),
  mainStreet: floor(NES.skin, (c) => {
    fill(c, NES.skin);
    for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < 16; x += 4) rect(c, x, y, 3, 3, NES.sand);
  }),
  /** The little shops on main street, seen from above: striped awning roofs. */
  shopRoof: solid(NES.redBright, (c) => {
    const look = (c.y >> 2) % 3; // a different shop every few squares
    const colors = [[NES.redBright, NES.white], [NES.sky, NES.white], [NES.gold, NES.white]][look];
    stripes(c, colors[0], colors[1], 4);
    if (c.near(0, 1) !== 'shopRoof' || ((c.y + 1) >> 2) % 3 !== look) {
      // The awning's scalloped edge, where one shop ends.
      for (let x = 0; x < 16; x += 4) rect(c, x + 1, 13, 2, 2, colors[0]);
      rect(c, 0, 15, 16, 1, NES.black);
    }
  }),

  // ---------- COASTER ----------
  queuePlaza: floor(NES.pastelBlue, (c) => {
    grid(c, NES.pastelBlue, NES.periwinkle, 8);
    speckle(c, NES.white, 2, 314);
  }),
  /** Roller-coaster track: two red rails with wooden ties, joining up with the track next door. */
  track: solid(NES.redBright, (c) => {
    fill(c, NES.grayLight);
    speckle(c, NES.gray, 6, 316);
    const across = same(c, -1, 0) || same(c, 1, 0);
    const down = same(c, 0, -1) || same(c, 0, 1);
    if (across) {
      const from = same(c, -1, 0) ? 0 : 3;
      const to = same(c, 1, 0) ? 16 : 13;
      for (let x = from; x < to; x += 3) rect(c, x, 3, 2, 10, NES.brownRed);
      rect(c, from, 4, to - from, 2, NES.redBright);
      rect(c, from, 10, to - from, 2, NES.redBright);
    }
    if (down) {
      const from = same(c, 0, -1) ? 0 : 3;
      const to = same(c, 0, 1) ? 16 : 13;
      for (let y = from; y < to; y += 3) rect(c, 3, y, 10, 2, NES.brownRed);
      rect(c, 4, from, 2, to - from, NES.redBright);
      rect(c, 10, from, 2, to - from, NES.redBright);
    }
  }),
  /** The coaster's station: a platform with a striped roof, where the cars stop. */
  station: solid(NES.gold, (c) => {
    stripes(c, NES.gold, NES.redBright, 4);
    rect(c, 0, 12, 16, 4, NES.grayLight);
    rect(c, 0, 12, 16, 1, NES.black);
  }),

  // ---------- CAROUSEL ----------
  carouselBoards: floor(NES.orangeLight, (c) => planks(c, NES.orangeLight, NES.ochre, NES.sand)),
  /** The carousel's round platform (the carousel itself spins on top, see rides/). */
  carouselBase: solid(NES.gold, (c) => {
    fill(c, NES.ochre);
    speckle(c, NES.gold, 4, 318);
  }),

  // ---------- SPLASH ----------
  poolDeck: floor(NES.skyLight, (c) => {
    grid(c, NES.white, NES.skyLight, 8);
    speckle(c, NES.mint, 2, 320);
  }),
  /** The lazy river (floating tubes go round it, see rides/). */
  river: solid(NES.sky, (c) => water(c, NES.sky, NES.skyLight, 322)),
  wavePool: solid(NES.blueMid, (c) => {
    water(c, NES.blueMid, NES.sky, 324);
    if (c.y % 2 === 0) for (let x = 1; x < 16; x += 5) rect(c, x, 4, 3, 1, NES.white); // little waves
  }),
  /** A water-slide tower in the wave pool: a yellow deck with a swirly blue-and-pink slide. */
  slideTower: solid(NES.gold, (c) => {
    fill(c, NES.gold);
    rect(c, 0, 0, 16, 1, NES.orange);
    const turn = (c.x + c.y) % 2;
    rect(c, turn ? 2 : 8, 0, 6, 16, NES.pink);
    rect(c, turn ? 3 : 9, 0, 2, 16, NES.pinkLight);
    rect(c, 0, turn ? 4 : 10, 16, 4, NES.sky);
  }),
  /** A splash pad: little water jets come up out of the floor (walk right through them!). */
  splashPad: floor(NES.mint, (c) => {
    fill(c, NES.mint);
    for (const [x, y] of [[3, 3], [11, 4], [7, 9], [3, 12], [12, 12]]) {
      rect(c, x, y, 2, 2, NES.sky);
      rect(c, x, y - 2, 1, 2, NES.skyLight);
    }
  }),

  // ---------- FUNHOUSE ----------
  /** The funhouse's walls: big rainbow stripes and a few stars. */
  funWall: solid(NES.purple, (c) => {
    const colors = [NES.pink, NES.gold, NES.cyan, NES.lavender];
    for (let x = 0; x < 16; x++) rect(c, x, 0, 1, 16, colors[Math.floor((x + c.x * 16 + c.y * 4) / 4) % colors.length]);
    if ((c.x + c.y * 3) % 4 === 0) {
      rect(c, 6, 4, 3, 3, NES.white);
      rect(c, 7, 3, 1, 5, NES.white);
      rect(c, 5, 5, 5, 1, NES.white);
    }
    if (c.near(0, 1) !== 'funWall' && c.near(0, 1) !== 'mirrorWall') rect(c, 0, 14, 16, 2, NES.plum);
  }),
  /** The funhouse's front door: a big round-topped doorway with a red-and-white frame. */
  funDoor: floor(NES.plum, (c) => {
    fill(c, NES.plum);
    rect(c, 2, 2, 12, 14, NES.black);
    rect(c, 4, 1, 8, 1, NES.redBright);
    rect(c, 1, 3, 2, 13, NES.redBright);
    rect(c, 13, 3, 2, 13, NES.redBright);
    rect(c, 1, 6, 2, 2, NES.white);
    rect(c, 13, 6, 2, 2, NES.white);
    rect(c, 1, 11, 2, 2, NES.white);
    rect(c, 13, 11, 2, 2, NES.white);
  }, { doorway: true }),
  /** The way back out of the funhouse. */
  funExit: floor(NES.gold, (c) => {
    fill(c, NES.gold);
    rect(c, 3, 3, 10, 10, NES.yellowLight);
    rect(c, 7, 5, 2, 7, NES.orange); // a little arrow pointing out
    rect(c, 5, 9, 6, 2, NES.orange);
    rect(c, 6, 11, 4, 1, NES.orange);
  }, { doorway: true }),
  /** Bouncy floor: soft squishy squares in pink and purple. */
  funFloor: floor(NES.pinkLight, (c) => {
    checker(c, NES.pinkLight, NES.lavender, 8);
    rect(c, 3, 3, 2, 2, NES.white); // a shiny spot on each cushion
    rect(c, 11, 11, 2, 2, NES.white);
  }),
  /** A wall of wavy mirrors: silly shiny glass in a gold frame. */
  mirrorWall: solid(NES.skyLight, (c) => {
    fill(c, NES.gold);
    rect(c, 2, 1, 12, 13, NES.skyLight);
    for (let y = 2; y < 13; y++) rect(c, 3 + Math.round(Math.sin((y + c.x) * 0.9) * 1.5) + 2, y, 2, 1, NES.white);
    rect(c, 0, 15, 16, 1, NES.ochre);
  }),
  /** The spinning tunnel's floor: a swirl of stripes. */
  tunnelFloor: floor(NES.lavender, (c) => {
    for (let x = 0; x < 16; x++) rect(c, x, 0, 1, 16, Math.floor((x + c.x * 16 + c.y * 8) / 4) % 2 ? NES.lavender : NES.white);
  }),
  /** The spinning tunnel's sides (stripes roll along them, see rides/). */
  tunnelWall: solid(NES.violet, (c) => {
    fill(c, NES.violet);
    rect(c, 0, c.near(0, 1) === 'tunnelFloor' ? 14 : 0, 16, 2, NES.plum);
  }),

  // ---------- WHEEL ----------
  hillGrass: floor(NES.greenSea, (c) => {
    grass(c, NES.greenBright, NES.seafoam, NES.greenSea, 326);
    if ((c.x * 5 + c.y * 3) % 13 === 0) rect(c, 7, 7, 2, 2, NES.white); // a tiny clover flower
  }),
  lookout: floor(NES.ochre, (c) => {
    planks(c, NES.ochre, NES.brownDark, NES.orangeLight);
    if (c.near(0, -1) !== 'lookout') rect(c, 0, 0, 16, 2, NES.brownRed); // the railing at the back
  }),

  // ---------- SNACKS ----------
  /** Red-and-white picnic checks. */
  snackPlaza: floor(NES.white, (c) => checker(c, NES.white, NES.pinkLight, 4)),

  // ---------- BUMPER ----------
  /** Silver diamond-plate floor around the bumper cars. */
  bumperDeck: floor(NES.grayLight, (c) => {
    fill(c, NES.grayLight);
    for (let y = 1; y < 16; y += 4) for (let x = (y >> 2) % 2 ? 3 : 1; x < 16; x += 4) rect(c, x, y, 2, 1, NES.white);
  }),
  /** The bumper-car floor: dark, with a glowing grid (the sparks overhead light it up). */
  arenaFloor: solid(NES.blueDark, (c) => {
    fill(c, NES.blueDark);
    rect(c, 0, 0, 16, 1, NES.periwinkle);
    rect(c, 0, 0, 1, 16, NES.periwinkle);
    rect(c, 0, 0, 2, 2, NES.skyLight);
  }),
  /** The soft bumper rail around the arena: black-and-yellow stripes. */
  bumperRail: solid(NES.gold, (c) => {
    fill(c, NES.gold);
    for (let k = -16; k < 16; k += 6) for (let i = 0; i < 16; i++) rect(c, i, i + k, 3, 1, NES.black);
    rect(c, 0, 0, 16, 1, NES.black);
    rect(c, 0, 15, 16, 1, NES.black);
  }),

  // ---------- FIREWORKS ----------
  /** The show plaza: dark blue stones with little gold stars. */
  showPlaza: floor(NES.periwinkle, (c) => {
    grid(c, NES.periwinkle, NES.purple, 8);
    if ((c.x + c.y * 2) % 3 === 0) {
      rect(c, 7, 6, 1, 3, NES.gold);
      rect(c, 6, 7, 3, 1, NES.gold);
    }
  }),
  /** The stage: wooden boards with a red curtain along the back. */
  stage: solid(NES.red, (c) => {
    if (c.near(0, -1) !== 'stage') {
      for (let x = 0; x < 16; x++) rect(c, x, 0, 1, 16, x % 4 === 0 ? NES.brownRed : NES.red);
      rect(c, 0, 0, 16, 2, NES.gold);
      return;
    }
    planks(c, NES.orange, NES.brownRed, NES.orangeLight);
    if (c.near(0, 1) !== 'stage') rect(c, 0, 12, 16, 4, NES.brownRed);
  }),

  // ---------- The fountain in the middle of the park ----------
  fountainBasin: solid(NES.sky, (c) => {
    water(c, NES.sky, NES.white, 328);
    if (c.near(0, -1) !== 'fountainBasin') rect(c, 0, 0, 16, 3, NES.grayLight);
    if (c.near(0, 1) !== 'fountainBasin') rect(c, 0, 13, 16, 3, NES.gray);
    if (c.near(-1, 0) !== 'fountainBasin') rect(c, 0, 0, 3, 16, NES.grayLight);
    if (c.near(1, 0) !== 'fountainBasin') rect(c, 13, 0, 3, 16, NES.grayLight);
  }),
};
