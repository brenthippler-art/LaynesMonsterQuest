import { type DecorKind } from '../../building/types';

/**
 * Parking lot and garden center things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 *   m mint  t teal  i periwinkle  e rose
 */

/** A little parked car (side view). The three colors share one shape. */
const car = (body: string, light: string): DecorKind => ({
  solid: true,
  on: ['stall'],
  sprite: [
    '....kkkkkkk.....',
    '...kBUUkUUUk....',
    '..kBUUUkUUUUk...',
    '.kkBBBBBBBBBBkk.',
    'kBBBBBBBBBBBBBBk',
    'krBBBBBBBBBBBByk',
    'kBBBBBBBBBBBBBBk',
    'kkkkkkkkkkkkkkkk',
    '..kAAk....kAAk..',
    '..kaak....kaak..',
    '...kk......kk...',
  ].map((row) => row.replace(/B/g, body).replace(/y/g, light)),
});

export const PARKING_GARDEN: Record<string, DecorKind> = {
  carRed: car('r', 'y'),
  carBlue: car('b', 'y'),
  carWhite: car('w', 'Y'),
  // A tall lamp post with a glowing yellow lamp on top.
  lampPost: {
    solid: true,
    sprite: [
      '...kkkkkkkk...',
      '..kAAAAAAAAk..',
      '..kyyYYYYyyk..',
      '...kkkkkkkk...',
      '......kk......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '.....kAAk.....',
      '....kAAAAk....',
      '....kkkkkk....',
    ],
  },
  // A blue cart corral: a little metal fence where carts get parked, with a cart inside.
  cartCorral: {
    solid: true,
    sprite: [
      'k..............k',
      'kbbbbbbbbbbbbbbk',
      'kb............bk',
      'kb..kkkkkkkk..bk',
      'kb..kbwbwbwk..bk',
      'kb..kwbwbwbk..bk',
      'kb...kkkkkk...bk',
      'kbbbbbbbbbbbbbbk',
      'kb............bk',
      'kb..A......A..bk',
      'kk............kk',
    ],
  },
  // A big blue shopping cart.
  cart: {
    solid: true,
    on: ['lot', 'sidewalk', 'aisle'],
    place: 'open',
    sprite: [
      'YY..............',
      '.Yk.............',
      '..kkkkkkkkkkkkk.',
      '..kbwbwbwbwbwbk.',
      '..kwbwbwbwbwbwk.',
      '...kbwbwbwbwbk..',
      '...kkkkkkkkkkk..',
      '....A.......A...',
      '..AAAAAAAAAAAA..',
      '...kk......kk...',
    ],
  },
  // A rain puddle with a little sky in it (you can splash right through).
  puddle: {
    solid: false,
    on: ['lot'],
    sprite: [
      '...uuuuuu...',
      '.uuUUuuuuuu.',
      'uuUwUuuuUuuu',
      '.uuuuuuUUuu.',
      '...uuuuuu...',
    ],
  },

  // ---------- Garden center ----------
  // A clay flower pot full of flowers.
  flowerPot: {
    solid: false,
    on: ['gardenFloor'],
    sprite: [
      '..P..Y..P...',
      '.PYP.YYPYP..',
      '..P.gYg.P...',
      '..g..g..g...',
      '...g.g.g....',
      'kkkkkkkkkkkk',
      'kOOOOOOOOOOk',
      '.kOdOOOOOOk.',
      '.kOOOOOOdOk.',
      '..kOOOOOOk..',
      '..kkkkkkkk..',
    ],
  },
  // A rack of seed packets, each with a picture of what grows.
  seedRack: {
    solid: true,
    on: ['gardenFloor'],
    place: 'wall',
    sprite: [
      '.kkkkkkkkkkkk.',
      '.kwwwwkwwwwwk.',
      '.kwPwwkwYwwwk.',
      '.kwgwwkwgwwwk.',
      '.kkkkkkkkkkkk.',
      '.kwwwwkwwwwwk.',
      '.kwrwwkwOwwwk.',
      '.kwgwwkwgwwwk.',
      '.kkkkkkkkkkkk.',
      '.kwwwwkwwwwwk.',
      '.kwuwwkwvwwwk.',
      '.kwgwwkwgwwwk.',
      '.kkkkkkkkkkkk.',
      '..k........k..',
      '.kkk......kkk.',
    ],
  },
  // A stack of three bags of potting soil.
  soilBags: {
    solid: true,
    on: ['gardenFloor'],
    sprite: [
      '...kkkkkkkk...',
      '..kGGGGGGGGk..',
      '..kGlGGGGNGk..',
      '..kkkkkkkkkk..',
      '.kGGGGGGGGGGk.',
      '.kGGlGGGGNGGk.',
      '.kkkkkkkkkkkk.',
      'kGGGGGGGGGGGGk',
      'kGGGlGGGGNGGGk',
      'kGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkk',
    ],
  },
  // A wooden table of little potted plants.
  plantTable: {
    solid: true,
    on: ['gardenFloor'],
    place: 'open',
    sprite: [
      '.l...g...l...g..',
      'lgl.glg.lgl.glg.',
      '.g...g...g...g..',
      'kOk.kOk.kOk.kOk.',
      'kkkkkkkkkkkkkkkk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      '.kd.........dk..',
      '.kd.........dk..',
      '.kd.........dk..',
      '.kk.........kk..',
    ],
  },
  // A little stone fountain splashing in the middle of the garden.
  fountain: {
    solid: true,
    sprite: [
      '.......U........',
      '.....U.U.U......',
      '....U..U..U.....',
      '...U...u...U....',
      '.......u........',
      '......kak.......',
      '......kak.......',
      '..kkkkkkkkkkkk..',
      '.kaaaaaaaaaaaak.',
      'kauuuUuuuuUuuuak',
      'kauuuuuuuuuuuuak',
      'kAaaaaaaaaaaaaAk',
      '.kAAAAAAAAAAAAk.',
      '..kkkkkkkkkkkk..',
    ],
  },
};
