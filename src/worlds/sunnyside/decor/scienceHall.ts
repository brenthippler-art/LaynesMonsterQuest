import { type DecorKind } from '../../building/types';

/** Science room things, and the cubbies along the hallway (letters as in classLibrary.ts). */
export const SCIENCE_HALL: Record<string, DecorKind> = {
  // A lab table with two bubbling beakers.
  beakerTable: {
    solid: true,
    on: ['scienceFloor'],
    place: 'open',
    sprite: [
      '..l......P......',
      '.l.l....P.P.....',
      '..ww......ww....',
      '..kk......kk....',
      '.kllk....kPPk...',
      '.kllk...kPPPPk..',
      'kkkkkkkkkkkkkkkk',
      'kaaaaaaaaaaaaaak',
      'kkkkkkkkkkkkkkkk',
      '.kA..........Ak.',
      '.kA..........Ak.',
      '.kk..........kk.',
    ],
  },
  // A model volcano on a board, with a little puff of pretend lava.
  volcano: {
    solid: true,
    on: ['scienceFloor'],
    place: 'open',
    sprite: [
      '....r....r....',
      '.....r..r.....',
      '......rr......',
      '.....kOOk.....',
      '....knOOnk....',
      '....knnOnk....',
      '...knnnnnnk...',
      '...kngnnnnk...',
      '..knnnnngnnk..',
      '..kngnnnnnnk..',
      '.knnnnnnnnnnk.',
      'kkkkkkkkkkkkkk',
      'kddddddddddddk',
      'kkkkkkkkkkkkkk',
    ],
  },
  // A red horseshoe magnet (you can walk past it).
  magnet: {
    solid: false,
    on: ['scienceFloor'],
    sprite: [
      '..rrrrrr..',
      '.rrrrrrrr.',
      'rrr....rrr',
      'rr......rr',
      'rr......rr',
      'rr......rr',
      'aa......aa',
      'aa......aa',
    ],
  },
  // A model rocket on a stand (also the SCIENCE icon).
  rocketModel: {
    solid: true,
    on: ['scienceFloor'],
    place: 'open',
    sprite: [
      '....kk....',
      '...krrk...',
      '...krrk...',
      '..kwwwwk..',
      '..kwuuwk..',
      '..kwuuwk..',
      '..kwwwwk..',
      '..kwwwwk..',
      '..kwrrwk..',
      '.krwwwwrk.',
      'krrwwwwrrk',
      'krkkkkkkrk',
      '...kOOk...',
      '...OYYO...',
      '....YY....',
      'kkkkkkkkkk',
    ],
  },
  // Little plants growing under a warm light.
  plantLight: {
    solid: true,
    on: ['scienceFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kAAAAAAAAAAAAk',
      'kyyyyyyyyyyyyk',
      '.k..........k.',
      '.k.l...l...l.k',
      '.klgl.lgl.lglk',
      '.k.g...g...g.k',
      '.kOOO.OOO.OOOk',
      'kkkkkkkkkkkkkk',
      'kA..........Ak',
      'kk..........kk',
    ],
  },

  // Cubbies along the hallway wall, with backpacks and lunch bags in them (placed by hand in layout.ts).
  cubby: {
    solid: true,
    on: ['hallFloor'],
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kddddkddddkddddk',
      'kdrrdkduudkdPPdk',
      'kdrrdkduudkdPPdk',
      'kddddkddddkddddk',
      'kkkkkkkkkkkkkkkk',
      'kddddkddddkddddk',
      'kdggdkddddkdOOdk',
      'kdggdkddddkdOOdk',
      'kddddkddddkddddk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
};
