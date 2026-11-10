import { type DecorKind } from '../../building/types';

/** Lunchroom and gym things (letters as in classLibrary.ts). */
export const LUNCH_GYM: Record<string, DecorKind> = {
  // A long cafeteria table with a bench in front.
  lunchTable: {
    solid: true,
    on: ['lunchFloor'],
    place: 'open',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kaaaaaaaaaaaaaak',
      'kaarraaaaaYYaaak',
      'kaaaaaaaaaaaaaak',
      'kkkkkkkkkkkkkkkk',
      '..kA........Ak..',
      'kkkkkkkkkkkkkkkk',
      'kuuuuuuuuuuuuuuk',
      'kkkkkkkkkkkkkkkk',
      '..kk........kk..',
    ],
  },
  // A lunch tray: an apple, peas and a sandwich (you can walk past it).
  tray: {
    solid: false,
    on: ['lunchFloor'],
    sprite: [
      'kkkkkkkkkkkk',
      'kuuuuuuuuuuk',
      'kurrugguyyuk',
      'kurrugguyyuk',
      'kuuuuuuuuuuk',
      'kkkkkkkkkkkk',
    ],
  },
  // A little carton of milk (also the LUNCH icon).
  milkCarton: {
    solid: false,
    on: ['lunchFloor'],
    sprite: [
      '...kk...',
      '..kwwk..',
      '.kwwwwk.',
      'kkkkkkkk',
      'kwwwwwwk',
      'kwuuuuwk',
      'kwuwwuwk',
      'kwuuuuwk',
      'kwwwwwwk',
      'kkkkkkkk',
    ],
  },
  // The serving line: warm pans of food behind a glass cover.
  servingLine: {
    solid: true,
    on: ['lunchFloor'],
    place: 'wall',
    sprite: [
      '..aaaaaaaaaaaa..',
      '..a..........a..',
      '..a.w....w...a..',
      'kkkkkkkkkkkkkkkk',
      'kAAAAAAAAAAAAAAk',
      'kAOOAAyyAAggAAAk',
      'kAAAAAAAAAAAAAAk',
      'kkkkkkkkkkkkkkkk',
      'kaaaaaaaaaaaaaak',
      'kaaaaaaaaaaaaaak',
      'kaaaaaaaaaaaaaak',
      'kkkkkkkkkkkkkkkk',
    ],
  },

  // A basketball hoop: backboard, orange rim, net and pole.
  hoop: {
    solid: true,
    on: ['gymFloor'],
    place: 'wall',
    sprite: [
      '.kkkkkkkkkkkk.',
      '.kwwwwwwwwwwk.',
      '.kwwwkkkkwwwk.',
      '.kwwwkwwkwwwk.',
      '.kwwwkkkkwwwk.',
      '.kkkkkkkkkkkk.',
      '...OOOOOOOO...',
      '....waaaaw....',
      '....awwwwa....',
      '.....aaaa.....',
      '......AA......',
      '......AA......',
      '......AA......',
      '....kkkkkk....',
    ],
  },
  // A climbing rope hanging from a beam, with knots to hold on to.
  climbRope: {
    solid: true,
    on: ['gymFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkk',
      'kAAAAAAAAAAk',
      'kkkkkkkkkkkk',
      '.....do.....',
      '.....od.....',
      '.....do.....',
      '.....od.....',
      '....dood....',
      '.....do.....',
      '.....od.....',
      '.....do.....',
      '....dood....',
      '.....do.....',
      '.....od.....',
      '.....kk.....',
    ],
  },
  // A big red bouncy rubber ball (also the GYM icon; it rolls around the playground too).
  bigBall: {
    solid: false,
    on: ['gymFloor', 'grass', 'blacktop'],
    sprite: [
      '...kkkk...',
      '.kkrrrrkk.',
      '.krwrrrrk.',
      'krwrrrrrrk',
      'krrrrrrrrk',
      'krrrrrrrrk',
      'krrrrrrRRk',
      '.krrrrRRk.',
      '.kkRRRRkk.',
      '...kkkk...',
    ],
  },
  // A blue folding gym mat (you can walk on it).
  gymMat: {
    solid: false,
    on: ['gymFloor'],
    place: 'open',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kuuuukuuuukuuuuk',
      'kuuuukuuuukuuuuk',
      'kbbbbkbbbbkbbbbk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // An orange cone (in the gym and on the bus loop).
  cone: {
    solid: false,
    on: ['gymFloor', 'road', 'sidewalk'],
    sprite: [
      '...kk...',
      '..kOOk..',
      '..kwwk..',
      '.kOOOOk.',
      '.kwwwwk.',
      'kOOOOOOk',
      'kkkkkkkk',
    ],
  },
};
