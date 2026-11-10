import { type DecorKind } from '../../building/types';

/**
 * Sporting goods and pet things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 *   t teal  i periwinkle
 */
export const SPORTS_PETS: Record<string, DecorKind> = {
  // ---------- Sporting goods ----------
  // A wire bin piled high with balls: soccer, basketball and a beach ball.
  ballBin: {
    solid: true,
    on: ['sportsFloor'],
    place: 'open',
    sprite: [
      '..kkk..kkk..kkk.',
      '.kwkwkkOkOkkrwbk',
      '.kkwkkOOkOOkwrbk',
      '.kwkwkkOkOkkbwrk',
      '..kkk..kkk..kkk.',
      'kkkkkkkkkkkkkkkk',
      'kAaAaAaAaAaAaAak',
      'kaAaAaAaAaAaAaAk',
      'kAaAaAaAaAaAaAak',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A shiny red bike on its kickstand.
  bike: {
    solid: true,
    on: ['sportsFloor'],
    sprite: [
      '..........kk....',
      '...kk.....kak...',
      '...kk....kr.....',
      '....krrrrrr.....',
      '....kr..krr.....',
      '..kkkr...krkk...',
      '.k...rk..kk..k..',
      'k...kk.k.k....k.',
      'k...k..k.k....k.',
      '.k....k...k..k..',
      '..kkkk.....kk...',
    ],
  },
  // A little orange camping tent with its door flap open.
  tent: {
    solid: true,
    on: ['sportsFloor'],
    place: 'open',
    sprite: [
      '.......k........',
      '......kOk.......',
      '.....kOOOk......',
      '....kOOkOOk.....',
      '...kOOkkkOOk....',
      '..kOOkkkkkOOk...',
      '.kOOkkkkkkkOOk..',
      'kOOOkkkkkkkOOOk.',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // Fishing poles standing in a rack, with a red-and-white bobber.
  fishingPoles: {
    solid: true,
    on: ['sportsFloor'],
    place: 'wall',
    sprite: [
      'k...k...k...',
      'k...k...k...',
      'k...k...k...',
      'k...k...k.r.',
      'k...k...k.w.',
      'n...n...n...',
      'n...n...n...',
      'kkkkkkkkkkkk',
      'kddddddddddk',
      'kkkkkkkkkkkk',
    ],
  },
  // A basketball hoop on a tall pole, with a net.
  hoop: {
    solid: true,
    on: ['sportsFloor'],
    place: 'wall',
    sprite: [
      '..kkkkkkkkkk..',
      '..kwwwwwwwwk..',
      '..kwwrrrrwwk..',
      '..kwwrwwrwwk..',
      '..kkkkkkkkkk..',
      '...rrrrrrrr...',
      '....w.w.w.w...',
      '.....wwwww....',
      '......kk......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '......Ak......',
      '.....kAAk.....',
      '....kkkkkk....',
    ],
  },

  // ---------- Pets ----------
  // A fish tank with a little orange fish and a plant.
  fishTank: {
    solid: true,
    on: ['petsFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kUUUUUUUUUUUUUUk',
      'kuuuuuuuuUuuuuuk',
      'kuuOOuuuuuuuuguk',
      'kuOOOOkuuuUuglgk',
      'kuuOOuuuuuuuuguk',
      'kuuuuuuuuuuuuguk',
      'kssssssssssssssk',
      'kkkkkkkkkkkkkkkk',
      'kddddddddddddddk',
      'kd............dk',
      'kk............kk',
    ],
  },
  // A soft round dog bed with a bone toy in it.
  dogBed: {
    solid: false,
    on: ['petsFloor'],
    sprite: [
      '..kkkkkkkkkk..',
      '.krrrrrrrrrrk.',
      'krpppppppppprk',
      'krppwwwwpppprk',
      'krpppppppppprk',
      '.krrrrrrrrrrk.',
      '..kkkkkkkkkk..',
    ],
  },
  // A big bag of kibble with a paw on the front.
  kibbleBag: {
    solid: true,
    on: ['petsFloor'],
    sprite: [
      '..kkkkkkkk..',
      '.kOOOOOOOOk.',
      '.kkkkkkkkkk.',
      '.kOOOOOOOOk.',
      'kOOwOwOwOOOk',
      'kOOOOOOOOOOk',
      'kOOOwwwwOOOk',
      'kOOOwwwwOOOk',
      'kOOOOOOOOOOk',
      'kOOOOOOOOOOk',
      'kkkkkkkkkkkk',
    ],
  },
  // A round bird cage with a little yellow bird on its swing.
  birdCage: {
    solid: true,
    on: ['petsFloor'],
    place: 'wall',
    sprite: [
      '......kk......',
      '.....kYYk.....',
      '...kkkkkkkk...',
      '..k.k.k.k.kk..',
      '.k.k.k.k.k.kk.',
      '.k.k.YY.k.k.k.',
      '.k.k.YY.k.k.k.',
      '.k.kkkkkk.k.k.',
      '.k.k.k.k.k.kk.',
      '.kkkkkkkkkkkk.',
      '..kddddddddk..',
      '...kkkkkkkk...',
    ],
  },
};
