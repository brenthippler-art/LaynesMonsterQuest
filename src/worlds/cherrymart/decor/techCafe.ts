import { type DecorKind } from '../../building/types';

/** Tech and cafe things (letters: see dealsToys.ts). No real brands: just shapes and colors. */
export const TECH_CAFE: Record<string, DecorKind> = {
  // A big TV showing a sunny cartoon sky.
  tvWall: {
    solid: true,
    on: ['techFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kuuuuuuuuuuuuuuk',
      'kuuuuuuuuuuYYuuk',
      'kuuwwuuuuuuYYuuk',
      'kuwwwwuuuuuuuuuk',
      'kuuuuuuuuuuuuuuk',
      'kllllllllllllllk',
      'kllllllllllllllk',
      'kkkkkkkkkkkkkkkk',
      '.......kk.......',
      '.....kkkkkk.....',
    ],
  },
  tablet: {
    solid: false,
    on: ['techFloor'],
    sprite: [
      'kkkkkkkk',
      'kuuuuuuk',
      'kuYuuuuk',
      'kullluuk',
      'kuuuuuuk',
      'kkkwkkkk',
      '..kkkk..',
    ],
  },
  // Headphones with red ear cups (the TECH sign).
  headphones: {
    solid: false,
    on: ['techFloor'],
    sprite: [
      '..kkkkkk..',
      '.k......k.',
      'k........k',
      'k........k',
      'kk......kk',
      'krk....krk',
      'krk....krk',
      'kk......kk',
    ],
  },
  // A game console box and its controller.
  gameConsole: {
    solid: false,
    on: ['techFloor'],
    sprite: [
      'kkkkkkkkkkkk',
      'kAAAAAAAAuAk',
      'kaaaaaaaaaak',
      'kkkkkkkkkkkk',
      '............',
      '.kkkkkkkkkk.',
      'kaAaaaaaarak',
      'kAAAaaaabaak',
      '.kkkkkkkkkk.',
    ],
  },

  // ---------- Cafe ----------
  // A little round cafe table with two stools.
  cafeTable: {
    solid: true,
    on: ['cafeFloor'],
    place: 'open',
    sprite: [
      '....kkkkkkkk....',
      '...kwwwwwwwwk...',
      '...kwwwwwwwwk...',
      '....kkkkkkkk....',
      '.kk....kk....kk.',
      'krrk...kk...krrk',
      '.kk....kk....kk.',
      '.kk....kk....kk.',
      '.kk...kkkk...kk.',
    ],
  },
  // A mug of hot cocoa with steam (the CAFE sign).
  cocoaMug: {
    solid: false,
    on: ['cafeFloor'],
    sprite: [
      '..w.w...',
      '...w.w..',
      '.kkkkk..',
      '.kNNNkk.',
      '.krrrk.k',
      '.krwrkk.',
      '.krrrk..',
      '..kkk...',
    ],
  },
  // A red popcorn cart with a glass box full of popcorn.
  popcornMachine: {
    solid: true,
    on: ['cafeFloor'],
    place: 'wall',
    sprite: [
      '....kkkkkk....',
      '...krrrrrrk...',
      '..kkkkkkkkkk..',
      '..kwywywywyk..',
      '..kywwywwywk..',
      '..kwywwywwyk..',
      '..kuuuuuuuuk..',
      '..kkkkkkkkkk..',
      '..krrrrrrrrk..',
      '..krrYYrrrrk..',
      '..krrrrrrrrk..',
      '..kkkkkkkkkk..',
      '...k......k...',
      '..kkk....kkk..',
    ],
  },
  // A soft pretzel with salt.
  pretzel: {
    solid: false,
    on: ['cafeFloor'],
    sprite: [
      '.dd....dd.',
      'dwod..dowd',
      'd...dd...d',
      '.d..dd..d.',
      '..dd..dd..',
      '..dw..wd..',
      '...dddd...',
    ],
  },
};
