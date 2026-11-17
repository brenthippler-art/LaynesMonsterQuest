import { type DecorKind } from '../../building/types';

/**
 * The aquarium and the sea-lion pool (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts (see gateSafari.ts for the list).
 */
export const AQUARIUM: Record<string, DecorKind> = {
  // A round fish tank on a stand, with an orange fish.
  fishTank: {
    solid: true,
    place: 'wall',
    on: ['aquaFloor'],
    sprite: [
      '...kkkkkkkkkk...',
      '.kkUUUUUUUUUUkk.',
      'kUUwUUUUUUUUUUUk',
      'kUwUUUkkkUUUUUUk',
      'kUUUUkOOOkkUUUUk',
      'kUUUUkOwOOOkUUUk',
      'kUUUUkOOOkkUUUUk',
      'kUUlUUkkkUUUUlUk',
      'kUlgUUUUUUUUlgUk',
      '.kkssssssssssskk',
      '...kkkkkkkkkkk..',
      '....kAAAAAAAk...',
      '....kAk...kAk...',
      '....kAk...kAk...',
      '...kAAAk.kAAAk..',
      '...kkkkk.kkkkk..',
    ],
  },
  // A pink branchy coral.
  coral: {
    solid: false,
    on: ['aquaFloor'],
    sprite: [
      'k.k...k.k...',
      'PkP.k.PkPk..',
      'kPPkPkkPPkPk',
      '.kPPPk.kPPPk',
      '..kPPPkPPPk.',
      '...kPPPPPk..',
      '....kePPk...',
      '...kkeeekk..',
    ],
  },
  // Tall green kelp, swaying in the water.
  kelp: {
    solid: true,
    on: ['aquaFloor'],
    sprite: [
      '.....kk.........',
      '....kGGk..kk....',
      '....kGgk.kGGk...',
      '.....kGk.kgGk...',
      '....kGgk..kGk...',
      '....kgGk.kGgk...',
      '.....kGk.kgGk...',
      '....kGgk..kGk...',
      '....kgGk.kGgk...',
      '.....kGk.kgGk...',
      '....kGgk..kGk...',
      '....kgGk.kGgk...',
      '.....kGk.kgGk...',
      '....kGgkkkGk....',
      '...kssssssssk...',
      '...kkkkkkkkkk...',
    ],
  },
  // A stream of shiny bubbles.
  bubbles: {
    solid: false,
    on: ['aquaFloor', 'tunnelFloor'],
    sprite: [
      '......kk..',
      '.....kUwk.',
      '..kk..kk..',
      '.kUwk.....',
      '..kk...kk.',
      '......kUk.',
      '...kk..k..',
      '..kUwk....',
      '...kk.....',
    ],
  },
  // A striped beach ball for the sea lions to balance.
  beachBall: {
    solid: false,
    on: ['boardwalk'],
    sprite: [
      '...kkkk...',
      '.kkrwwbkk.',
      'krrrwwbbbk',
      'krrwwwwbbk',
      'kYYwwwwuuk',
      'kYYYwwuuuk',
      '.kkYwwukk.',
      '...kkkk...',
    ],
  },
};
