import { type DecorKind } from '../../building/types';

/**
 * Produce, bakery and frozen things, and the checkout lanes (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 *   m mint  e rose
 */
export const FOOD_AISLES: Record<string, DecorKind> = {
  // ---------- Produce ----------
  // A wooden bin heaped with apples, oranges and bananas.
  fruitBin: {
    solid: true,
    on: ['produceFloor'],
    place: 'open',
    sprite: [
      '..r.O..Y.r..O...',
      '.rrOOOYYYrrOOO..',
      'rrrOOOYYrrrOOOO.',
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'kddddddddddddddk',
      'knnnnnnnnnnnnnnk',
      '.kk..........kk.',
    ],
  },
  // A green bin of carrots, lettuce and broccoli.
  veggieBin: {
    solid: true,
    on: ['produceFloor'],
    place: 'open',
    sprite: [
      '.g.g..l...G.G...',
      '.O.O.lll.GGGGG..',
      'OOOOlllllGGGGGG.',
      'kkkkkkkkkkkkkkkk',
      'kggggggggggggggk',
      'kGGGGGGGGGGGGGGk',
      'kggggggggggggggk',
      '.kk..........kk.',
    ],
  },
  // A misting sprayer on a pole that keeps the veggies cool and fresh.
  mister: {
    solid: true,
    on: ['produceFloor'],
    place: 'wall',
    sprite: [
      'U.U.U.U.U.',
      '.U.U.U.U..',
      'kkkkkkkkkk',
      'kaaaaaaaak',
      'kkkkAkkkkk',
      '....Ak....',
      '....Ak....',
      '....Ak....',
      '....Ak....',
      '....Ak....',
      '...kAAk...',
      '..kkkkkk..',
    ],
  },
  // A hanging produce scale with a round dial and a basket.
  scale: {
    solid: true,
    on: ['produceFloor'],
    place: 'wall',
    sprite: [
      '.....kk.....',
      '...kkkkkk...',
      '..kwwwwwwk..',
      '.kwwwkwwwwk.',
      '.kwwwkrwwwk.',
      '.kwwwwwwwwk.',
      '..kwwwwwwk..',
      '...kkkkkk...',
      '.....kk.....',
      '..k......k..',
      '.kAAAAAAAAk.',
      '..kAAAAAAk..',
      '...kkkkkk...',
    ],
  },

  // ---------- Bakery ----------
  // A glass case of sprinkle donuts.
  donutCase: {
    solid: true,
    on: ['bakeryFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kUUUUUUUUUUUUUUk',
      'kUoPoUUoyoUUoeok',
      'kUPkPUUykyUUekek',
      'kUoPoUUoyoUUoeok',
      'kUUUUUUUUUUUUUUk',
      'kkkkkkkkkkkkkkkk',
      'kwwwwwwwwwwwwwwk',
      'kwwwwwwwwwwwwwwk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A rack of crusty bread loaves.
  breadRack: {
    solid: true,
    on: ['bakeryFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'k.kddk..kddk.k',
      'kkdoodkkdoodkk',
      'kkkkkkkkkkkkkk',
      'k..kddddddk..k',
      'k.kdoooooodk.k',
      'kkkkkkkkkkkkkk',
      'k.kddk..kddk.k',
      'kkdoodkkdoodkk',
      'kkkkkkkkkkkkkk',
      'k............k',
      'kk..........kk',
    ],
  },
  // The cake decorating counter: a pink frosted cake on a stand, with a frosting bag.
  cakeCounter: {
    solid: true,
    on: ['bakeryFloor'],
    sprite: [
      '.....r..........',
      '....kkkk.....w..',
      '...kppppk...kwk.',
      '..kpPpPppk..kPk.',
      '..kppppppk...k..',
      '..kssssssk......',
      '..kpPpPppk......',
      '...kkkkkk.......',
      'kkkkkkkkkkkkkkkk',
      'kwwwwwwwwwwwwwwk',
      'kbbbbbbbbbbbbbbk',
      'kwwwwwwwwwwwwwwk',
      'kbbbbbbbbbbbbbbk',
      'kkkkkkkkkkkkkkkk',
    ],
  },

  // ---------- Frozen ----------
  // An open chest freezer full of ice cream tubs.
  freezerChest: {
    solid: true,
    on: ['frozenFloor'],
    place: 'open',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kUUUUUUUUUUUUUUk',
      'kUpppUyyyUnnnUUk',
      'kUpppUyyyUnnnUUk',
      'kUUUUUUUUUUUUUUk',
      'kkkkkkkkkkkkkkkk',
      'kwwwwwwwwwwwwwwk',
      'kwbbbbbbbbbbbbwk',
      'kwwwwwwwwwwwwwwk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A white ice box with bags of ice and a snowflake on the door.
  iceBox: {
    solid: true,
    on: ['frozenFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkk',
      'kwwwwwwwwwwk',
      'kwwwwUwwwwwk',
      'kwwUwUwUwwwk',
      'kwwwUUUwwwwk',
      'kwwUUwUUwwwk',
      'kwwwUUUwwwwk',
      'kwwUwUwUwwwk',
      'kwwwwUwwwwwk',
      'kwwwwwwwwwwk',
      'kkkkkkkkkkkk',
      '.kk......kk.',
    ],
  },
  // A frosty patch on the floor (it's cold by the freezers!).
  frostPatch: {
    solid: false,
    on: ['frozenFloor'],
    sprite: [
      '..w.....U..',
      '.UwU...wUw.',
      '..w..w..U..',
      '....UwU....',
      '.....w.....',
    ],
  },

  // ---------- The front of the store ----------
  // A checkout lane: a belt, a little screen and a bag stand.
  checkout: {
    solid: true,
    sprite: [
      '..........kkk...',
      '..........kuk...',
      '..........kkk...',
      '...........k....',
      'kkkkkkkkkkkkkkkk',
      'kAkAkAkAkAkbbbbk',
      'kkkkkkkkkkkbbbbk',
      'kbbbbbbbbbbbbbbk',
      'kbbbbbbbbbbbbbbk',
      'kYYYYYYYYYYYYYYk',
      'kbbbbbbbbbbbbbbk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
};
