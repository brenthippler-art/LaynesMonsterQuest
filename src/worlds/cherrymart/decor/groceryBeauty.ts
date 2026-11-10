import { type DecorKind } from '../../building/types';

/** Grocery and beauty things (letters: see dealsToys.ts). Plain boxes and bottles, no brands. */
export const GROCERY_BEAUTY: Record<string, DecorKind> = {
  // A shelf of cereal boxes in every color.
  cerealShelf: {
    solid: true,
    on: ['groceryFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kOOkbbkYYkrrkllk',
      'kOwkbwkYwkrwklwk',
      'kOOkbbkYYkrrkllk',
      'kOOkbbkYYkrrkllk',
      'kkkkkkkkkkkkkkkk',
      'kPPkuukddkggkRRk',
      'kPwkuwkdwkgwkRwk',
      'kPPkuukddkggkRRk',
      'kPPkuukddkggkRRk',
      'kkkkkkkkkkkkkkkk',
      '.k............k.',
    ],
  },
  // A wooden bin heaped with apples, bananas, limes and oranges (the GROCERY sign).
  fruitBin: {
    solid: true,
    on: ['groceryFloor'],
    place: 'open',
    sprite: [
      '.rrr.YYY.lll.OOO',
      'rrrrYYYYllllOOOO',
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'knNnnNnnNnnNnnnk',
      'knnnnnnnnnnnnnnk',
      'kkkkkkkkkkkkkkkk',
      '.kk..........kk.',
    ],
  },
  // A glass-door fridge full of drinks.
  fridge: {
    solid: true,
    on: ['groceryFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kUUUUUUkUUUUUk',
      'kUbrlUUkUYOgUk',
      'kUbrlUUkUYOgUk',
      'kaaaaaakaaaaak',
      'kUwwPUUkUruwUk',
      'kUwwPUUkUruwUk',
      'kaaaaaakaaaaak',
      'kUlYrUUkUbbOUk',
      'kUlYrUUkUbbOUk',
      'kaaaaaakaaaaak',
      'kkkkkkkkkkkkkk',
    ],
  },

  // ---------- Beauty ----------
  // A round mirror on a pink counter.
  vanityMirror: {
    solid: true,
    on: ['beautyFloor'],
    place: 'wall',
    sprite: [
      '....kkkkkk....',
      '...kwUUUUwk...',
      '..kUUwUUUUUk..',
      '..kUwUUUUUUk..',
      '..kUUUUUUUUk..',
      '...kUUUUUUk...',
      '....kkkkkk....',
      'kkkkkkkkkkkkkk',
      'kPPPPPPPPPPPPk',
      'kPPPYPPPPYPPPk',
      'kPPPPPPPPPPPPk',
      'kkkkkkkkkkkkkk',
      '.k..........k.',
      '.k..........k.',
    ],
  },
  // A rainbow row of nail polish bottles.
  nailPolish: {
    solid: false,
    on: ['beautyFloor'],
    sprite: [
      '.k..k..k..k.',
      'kkkkkkkkkkkk',
      'rwrYwYlwlbwb',
      'rrrYYYlllbbb',
      'rrrYYYlllbbb',
    ],
  },
  // A bottle of bubble bath with bubbles floating up.
  bubbleBath: {
    solid: false,
    on: ['beautyFloor'],
    sprite: [
      '.u..U...',
      'U..u..U.',
      '..kkk...',
      '..kak...',
      '.kkkkk..',
      '.kmmmk..',
      '.kmwmk..',
      '.kmmmk..',
      '.kkkkk..',
    ],
  },
  // A fancy perfume bottle (the BEAUTY sign).
  perfume: {
    solid: false,
    on: ['beautyFloor'],
    sprite: [
      '...kk...',
      '...kk...',
      '..kkkk..',
      '.kLLLLk.',
      'kLLwLLLk',
      'kLLLLvLk',
      'kLLLLLLk',
      '.kLLLLk.',
      '..kkkk..',
    ],
  },
};
