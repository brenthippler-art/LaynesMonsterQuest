import { type DecorKind } from '../../building/types';

/**
 * Auto center and tools things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 */
export const AUTO_TOOLS: Record<string, DecorKind> = {
  // ---------- Auto center ----------
  // A stack of three tires.
  tireStack: {
    solid: true,
    on: ['garageFloor'],
    sprite: [
      '..kkkkkkkkkk..',
      '.kNkkkkkkkkNk.',
      '.kkkAaaaaAkkk.',
      '..kkkkkkkkkk..',
      '.kNkkkkkkkkNk.',
      '.kkkAaaaaAkkk.',
      '..kkkkkkkkkk..',
      '.kNkkkkkkkkNk.',
      '.kkkAaaaaAkkk.',
      '..kkkkkkkkkk..',
    ],
  },
  // Three cans of motor oil in a row.
  oilCans: {
    solid: false,
    on: ['garageFloor'],
    sprite: [
      '.kk...kk...kk..',
      'kYYk.kbbk.kYYk.',
      'kYYk.kbbk.kYYk.',
      'kkkk.kkkk.kkkk.',
      'kYYk.kbbk.kYYk.',
      'kwYk.kwbk.kwYk.',
      'kYYk.kbbk.kYYk.',
      'kkkk.kkkk.kkkk.',
    ],
  },
  // A red rolling toolbox with drawers.
  toolbox: {
    solid: true,
    on: ['garageFloor', 'toolsFloor'],
    place: 'wall',
    sprite: [
      '.kkkkkkkkkkkk.',
      'krrrrrrrrrrrrk',
      'kkkkkkkkkkkkkk',
      'krrrrraarrrrrk',
      'kkkkkkkkkkkkkk',
      'krrrrraarrrrrk',
      'kkkkkkkkkkkkkk',
      'krrrrraarrrrrk',
      'kkkkkkkkkkkkkk',
      '.kk........kk.',
    ],
  },
  // A blue car up on a lift, getting its tires checked.
  carLift: {
    solid: true,
    sprite: [
      '....kkkkkkk.....',
      '...kbUUkUUUk....',
      '..kbUUUkUUUUk...',
      '.kkbbbbbbbbbbkk.',
      'kbbbbbbbbbbbbbbk',
      'kkkkkkkkkkkkkkkk',
      '..kkk......kkk..',
      'kkkkkkkkkkkkkkkk',
      'kYkYkYkYkYkYkYkk',
      'kkkkkkkkkkkkkkkk',
      '..kA........Ak..',
      '..kA........Ak..',
      '..kA........Ak..',
      '.kkkk......kkkk.',
    ],
  },

  // ---------- Tools ----------
  // A pegboard with hammers and a wrench hanging on it.
  hammerRack: {
    solid: true,
    on: ['toolsFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kddddddddddddddk',
      'kdAAAddAAddAAAdk',
      'kdAAAddAAddAAAdk',
      'kddnddddAdddnddk',
      'kddnddddAdddnddk',
      'kddndddAAAddnddk',
      'kddnddddddddnddk',
      'kddddddddddddddk',
      'kkkkkkkkkkkkkkkk',
      '.kk..........kk.',
    ],
  },
  // A drill on a little display stand.
  drillStand: {
    solid: true,
    on: ['toolsFloor'],
    sprite: [
      '..kkkkkkkk....',
      '.kYYYYYYYkkkk.',
      'kYYYYYYYYkaaak',
      '.kYYYYYYYkkkk.',
      '...kYkk.......',
      '...kYk........',
      '...kkk........',
      'kkkkkkkkkkkkkk',
      'kAAAAAAAAAAAAk',
      'kkkkkkkkkkkkkk',
      '.kA........Ak.',
      '.kk........kk.',
    ],
  },
  // Bins full of nuts and bolts.
  boltBins: {
    solid: true,
    on: ['toolsFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kaAaAkkAaAaAAk',
      'kbbbbbkkbbbbbk',
      'kbbbbbkkbbbbbk',
      'kkkkkkkkkkkkkk',
      'kAaAakkaAaAAak',
      'kbbbbbkkbbbbbk',
      'kbbbbbkkbbbbbk',
      'kkkkkkkkkkkkkk',
      '.k..........k.',
    ],
  },
  // A tall yellow stepladder.
  ladder: {
    solid: true,
    on: ['toolsFloor'],
    sprite: [
      '....kkkkk...',
      '....kYYYk...',
      '...kYkkkYk..',
      '...kYYYYYk..',
      '...kYk.kYk..',
      '..kYYYYYYYk.',
      '..kYk...kYk.',
      '..kYYYYYYYk.',
      '.kYk.....kYk',
      '.kYYYYYYYYYk',
      '.kYk.....kYk',
      'kYYYYYYYYYYk',
      'kYk......kYk',
      'kkk......kkk',
    ],
  },
  // Two cans of paint with drips of color down their sides.
  paintCans: {
    solid: false,
    on: ['toolsFloor'],
    sprite: [
      '.kkkkk..kkkkk.',
      'kaaaaak.kaaaak',
      'kPPPPPk.kuuuuk',
      'kwPwwwk.kwwuwk',
      'kwPwwwk.kwwuwk',
      'kwwwwwk.kwwwwk',
      'kwwwwwk.kwwwwk',
      '.kkkkk..kkkkk.',
    ],
  },
};
