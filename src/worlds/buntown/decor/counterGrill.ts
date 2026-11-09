import { type DecorKind } from '../../building/types';

/**
 * Counter and grill things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre
 */
export const COUNTER_GRILL: Record<string, DecorKind> = {
  register: {
    solid: true,
    place: 'wall',
    sprite: [
      '....kkkkkkk.',
      '....kuuuuuk.',
      '....kuwuuuk.',
      '....kkkkkkk.',
      '.....kAk....',
      'kkkkkkkkkkkk',
      'kaawawawaaak',
      'kawawawawaak',
      'kaaaaaaaaaak',
      'kkkkkkkkkkkk',
      'kRRRRRRRRRRk',
      'kRRRRYYRRRRk',
      'kkkkkkkkkkkk',
    ],
  },
  // A menu board with pictures (a burger, fries, a drink): no words, just food.
  menuBoard: {
    solid: true,
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kBBBBBBBBBBBBBBk',
      'kBBOOBBYBYBBwwBk',
      'kBOOOOBYYYBBrrBk',
      'kBllllBrrrBBwwBk',
      'kBnnnnBrrrBBwwBk',
      'kBOOOOBBBBBBwwBk',
      'kBBBBBBBBBBBBBBk',
      'kBYYBBYYBBBYYBBk',
      'kBBBBBBBBBBBBBBk',
      'kkkkkkkkkkkkkkkk',
      '...kk......kk...',
      '...kk......kk...',
      '...kk......kk...',
      '..kkkk....kkkk..',
    ],
  },
  trayStack: {
    solid: false,
    sprite: [
      '.kkkkkkkkkk.',
      'krrrrrrrrrrk',
      'kRRRRRRRRRRk',
      'krrrrrrrrrrk',
      'kRRRRRRRRRRk',
      '.kkkkkkkkkk.',
    ],
  },
  napkins: {
    solid: false,
    sprite: [
      '...kkkk...',
      '...kwwk...',
      '.kkkwwkkk.',
      '.kaaaaaak.',
      '.kawwwwak.',
      '.kawwwwak.',
      '.kaaaaaak.',
      '.kAAAAAAk.',
      '.kkkkkkkk.',
    ],
  },

  // A flat-top grill with three patties sizzling on it.
  flatGrill: {
    solid: true,
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kAAAAAAAAAAAAAAk',
      'kAnnAAAnnAAAnnAk',
      'kAnnAAAnnAAAnnAk',
      'kAAAAAAAAAAAAAAk',
      'kkkkkkkkkkkkkkkk',
      'kaaaaaaaaaaaaaak',
      'kakkakkakkakkaak',
      'kaaaaaaaaaaaaaak',
      'kaaaaaaaaaaaaaak',
      'kaAAAAAAAAAAAAak',
      'kaaaaaaaaaaaaaak',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  spatula: {
    solid: false,
    sprite: [
      '.kkkk.',
      'kaaaak',
      'kaAAak',
      'kaaaak',
      '.kkkk.',
      '..kk..',
      '..kk..',
      '.knnk.',
      '.knnk.',
      '.knnk.',
      '.kkkk.',
    ],
  },
  // A rolling rack of buns.
  bunRack: {
    solid: true,
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'ka.oo.oo.oo.ak',
      'ka.OO.OO.OO.ak',
      'kaaaaaaaaaaaak',
      'ka.oo.oo.oo.ak',
      'ka.OO.OO.OO.ak',
      'kaaaaaaaaaaaak',
      'ka.oo.oo.oo.ak',
      'ka.OO.OO.OO.ak',
      'kaaaaaaaaaaaak',
      'ka..........ak',
      'kaaaaaaaaaaaak',
      'kk..........kk',
      'kAk........kAk',
      '.k..........k.',
    ],
  },
  // Warming lights glowing over a shelf of wrapped burgers.
  warmLight: {
    solid: true,
    place: 'wall',
    sprite: [
      '.kkkkkkkkkkkkkk.',
      '.kaaaaaaaaaaaak.',
      '.kkkkkkkkkkkkkk.',
      '..kYk..kYk..kYk.',
      '..yYy..yYy..yYy.',
      '...y....y....y..',
      '................',
      '.kOOk.kOOk.kOOk.',
      '.kOOk.kOOk.kOOk.',
      'kkkkkkkkkkkkkkkk',
      'kaaaaaaaaaaaaaak',
      'kkkkkkkkkkkkkkkk',
      '.kak........kak.',
      '.kkk........kkk.',
    ],
  },
  burger: {
    solid: false,
    sprite: [
      '..kkkkkkkk..',
      '.kOOwOOwOOk.',
      'kOOOOOOOOOOk',
      'kllllllllllk',
      'kYYYYYYYYYYk',
      'knnnnnnnnnnk',
      'kOOOOOOOOOOk',
      '.kkkkkkkkkk.',
    ],
  },
};
