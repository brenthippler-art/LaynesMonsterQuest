import { type DecorKind } from '../../building/types';

/**
 * Classroom and library things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 */
export const CLASS_LIBRARY: Record<string, DecorKind> = {
  // A kid's desk with a paper on top and a little blue chair tucked in.
  desk: {
    solid: true,
    on: ['classFloor'],
    place: 'open',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kooowooooooook',
      'kooowwoooooook',
      'kddddddddddddk',
      'kkkkkkkkkkkkkk',
      '.kA........Ak.',
      '.kA..kkkk..Ak.',
      '.kA..kuuk..Ak.',
      '.kA..kkkk..Ak.',
      '.kk..k..k..kk.',
    ],
  },
  // A green chalkboard with chalk doodles, in a wooden frame (also the CLASS icon).
  chalkboard: {
    solid: true,
    on: ['classFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'knGGGGGGGGGGGGnk',
      'knGwGGwwGGGGGGnk',
      'knGwwGGGGwGwGGnk',
      'knGwGwGGGGwGGGnk',
      'knGGGGGGwwwwwGnk',
      'knGGGGGGGGGGGGnk',
      'knnnnnnnnnnnnnnk',
      'kkkkkkkkkkkkkkkk',
      '..kA........Ak..',
      '..kA........Ak..',
      '.kkk........kkk.',
    ],
  },
  // An alphabet poster on a stand: a big red A, blue B and gold C.
  abcPoster: {
    solid: true,
    on: ['classFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kwwwwwwwwwwwwk',
      'kwrwwbbwwwYYwk',
      'krwrwbwbwYwwwk',
      'krrrwbbwwYwwwk',
      'krwrwbwbwYwwwk',
      'krwrwbbwwwYYwk',
      'kwwwwwwwwwwwwk',
      'kkkkkkkkkkkkkk',
      '......kk......',
      '......kk......',
      '....kkkkkk....',
    ],
  },
  // A round rainbow reading rug (you can walk on it).
  readingRug: {
    solid: false,
    on: ['classFloor'],
    place: 'open',
    sprite: [
      '...kkkkkkkk...',
      '.kkrrrrrrrrkk.',
      'krrOOOOOOOOrrk',
      'krOOYYYYYYOOrk',
      'krrOOOOOOOOrrk',
      '.kkrrrrrrrrkk.',
      '...kkkkkkkk...',
    ],
  },
  // The class pet's tank: a goldfish, a plant and a bubble.
  petTank: {
    solid: true,
    on: ['classFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kaaaaaaaaaaaak',
      'kUUUUUUUUUUUUk',
      'kUUUUUOOUUUUUk',
      'kUUgUUOOOOUUUk',
      'kUUgUUUOOUUUUk',
      'kUgUUUUUUUUUUk',
      'kUgUUUUUUwUUUk',
      'kssssssssssssk',
      'kkkkkkkkkkkkkk',
      '.kAAAAAAAAAAk.',
      '.kA........Ak.',
      '.kk........kk.',
    ],
  },

  // A tall bookshelf full of colorful books.
  bookshelf: {
    solid: true,
    on: ['libraryFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'knrbYgPurvOlbYnk',
      'knrbYgPurvOlbYnk',
      'knrbYgPurvOlbYnk',
      'knnnnnnnnnnnnnnk',
      'knvOlbrYgPuvbOnk',
      'knvOlbrYgPuvbOnk',
      'knvOlbrYgPuvbOnk',
      'knnnnnnnnnnnnnnk',
      'knuPgYbrOlvuPgnk',
      'knuPgYbrOlvuPgnk',
      'knnnnnnnnnnnnnnk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A squishy pink beanbag (you can walk on it).
  beanbag: {
    solid: false,
    on: ['libraryFloor'],
    place: 'open',
    sprite: [
      '....kkkk....',
      '..kkPPPPkk..',
      '.kPPPPpPPPk.',
      'kPPPPPPPpPPk',
      'kPPPPPPPPPPk',
      'kPPPPPPPPPPk',
      '.kkkkkkkkkk.',
    ],
  },
  // The story-time rocking chair.
  storyChair: {
    solid: true,
    on: ['libraryFloor'],
    place: 'wall',
    sprite: [
      '..kkkkkkkk..',
      '..krrrrrrk..',
      '..krwrrwrk..',
      '..krrrrrrk..',
      '..krwrrwrk..',
      'kkkkkkkkkkkk',
      'kooooooooook',
      'kkkkkkkkkkkk',
      '.kd......dk.',
      '.kd......dk.',
      'kkkkkkkkkkkk',
      '.kkkkkkkkkk.',
    ],
  },
  // A spinning globe on a stand.
  globe: {
    solid: true,
    on: ['libraryFloor'],
    place: 'open',
    sprite: [
      '....kkkk....',
      '..kkuuggkk..',
      '.kuugggguuk.',
      '.kuuuggguuk.',
      '.kuuuuuuggk.',
      '.kuuuuugggk.',
      '..kkuuuukk..',
      '....kkkk....',
      '.....kk.....',
      '....kkkk....',
      '..kkddddkk..',
      '..kkkkkkkk..',
    ],
  },
  // A little stack of books (also the LIBRARY icon).
  bookStack: {
    solid: false,
    on: ['libraryFloor'],
    sprite: [
      '.kkkkkkkk.',
      '.krrrrrrk.',
      'kkkkkkkkkk',
      'kbbbbbbbwk',
      'kkkkkkkkkk',
      '.kYYYYYYk.',
      '.kkkkkkkk.',
    ],
  },
};
