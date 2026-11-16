import { type DecorKind } from '../../building/types';

/**
 * The jungle and the polar area (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts (see gateSafari.ts for the list).
 */
export const JUNGLE_POLAR: Record<string, DecorKind> = {
  // ---------- JUNGLE ----------
  // A tall palm tree with big floppy leaves and two coconuts.
  palm: {
    solid: true,
    sprite: [
      '..kk..kkk..kk...',
      '.kllkkgggkkllk..',
      'kllggkgggkgglk..',
      'kgk.kggGggk.kgk.',
      'kk.kgkNkNkgk.kk.',
      '..kgk.kNk.kgk...',
      '..kk..knk..kk...',
      '......knk.......',
      '.......nk.......',
      '.......kn.......',
      '.......kn.......',
      '......knk.......',
      '......knk.......',
      '......knnk......',
      '.....kNNNNk.....',
      '.....kkkkkk.....',
    ],
  },
  // A leafy fern, low enough to walk through.
  fern: {
    solid: false,
    sprite: [
      '.k....k....k',
      'kgk..klk..kg',
      'kgGkkgllkkGg',
      '.kgGkglgkGgk',
      '..kgGgGgGgk.',
      '...kkGGGkk..',
    ],
  },
  // A huge jungle flower with pink petals.
  jungleFlower: {
    solid: false,
    sprite: [
      '...kkk.kkk..',
      '..kPPPkPPPk.',
      '..kPpPkPpPk.',
      '.kkkkYYYkkkk',
      'kPPPkYrYkPPP',
      'kPpPkYYYkPpP',
      '.kkkkPPPkkkk',
      '..kPpPkgk...',
      '..kkkkkgk...',
      '.....kgk....',
    ],
  },
  // A bunch of bananas growing on a stalk.
  bananas: {
    solid: true,
    sprite: [
      '.......kk.......',
      '......kGGk......',
      '......kgGk......',
      '.....kkgkkk.....',
      '...kkYYkYYYkk...',
      '..kYYYkYYYkYYk..',
      '..kYYkYYYYkYYk..',
      '..kYkYYkYYYkYk..',
      '...kkYYkYYkkk...',
      '....kkYYYkk.....',
      '......kkk.......',
      '.......kn.......',
      '.......kn.......',
      '.......kn.......',
      '......kNNk......',
      '......kkkk......',
    ],
  },

  // ---------- POLAR ----------
  // A round igloo made of snow blocks, with a dark doorway.
  igloo: {
    solid: true,
    sprite: [
      '................',
      '.....kkkkkk.....',
      '...kkwwwwwwkk...',
      '..kwwUwwwUwwwk..',
      '.kwwwkkkkkkwwwk.',
      '.kwUwwwwUwwwwUk.',
      'kwwkkkkkkkkkkwwk',
      'kwwwwUwkkkwUwwwk',
      'kUwwwwkBBBkwwwUk',
      'kkkkkkkBBBkkkkkk',
      'kwwUwwkBBBkwUwwk',
      'kwwwwwkBBBkwwwwk',
      'kUUUUUkBBBkUUUUk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A big shiny block of ice.
  iceBlock: {
    solid: true,
    sprite: [
      '..kkkkkkkkkk..',
      '.kwUUUUUUUUUk.',
      'kwwUUUUUUUuUuk',
      'kwUUUwUUUUUUuk',
      'kUUUwUUUUUUuuk',
      'kUUUUUUUUUUuuk',
      'kUUUUUUUUUuuuk',
      'kUUUUUUUUuuuuk',
      'kuuuuuuuuuuuuk',
      'kkkkkkkkkkkkkk',
    ],
  },
  // A soft little pile of snow.
  snowPile: {
    solid: false,
    on: ['snow'],
    sprite: [
      '....kkkk....',
      '..kkwwwwkk..',
      '.kwwwwwwwUk.',
      'kwwwwwwwUUUk',
      'kUUUUUUUUUUk',
      'kkkkkkkkkkkk',
    ],
  },
  // A bucket of fish for the penguins' lunch.
  fishBucket: {
    solid: true,
    sprite: [
      '...kk....kk.',
      '..kaak..kOOk',
      '..kaak.kOOk.',
      '.kkkkkkkkkk.',
      'kAaaaaaaaaAk',
      '.kAaaaaaaAk.',
      '.kAaaaaaaAk.',
      '.kAAAAAAAAk.',
      '..kkkkkkkk..',
    ],
  },
};
