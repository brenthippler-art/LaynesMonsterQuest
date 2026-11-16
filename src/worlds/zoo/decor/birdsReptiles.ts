import { type DecorKind } from '../../building/types';

/**
 * The aviary and the reptile house (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts (see gateSafari.ts for the list).
 */
export const BIRDS_REPTILES: Record<string, DecorKind> = {
  // ---------- BIRDS ----------
  // A little blue birdhouse on a pole.
  birdhouse: {
    solid: true,
    sprite: [
      '......kk........',
      '....kkrrkk......',
      '..kkrrrrrrkk....',
      '.krrrrrrrrrrk...',
      '..kuuuuuuuuk....',
      '..kuuukkuuuk....',
      '..kuukNNkuuk....',
      '..kuuukkuuuk....',
      '..kuunnnnuuk....',
      '..kkkkkkkkkk....',
      '......kn........',
      '......kn........',
      '......kn........',
      '......kn........',
      '.....kNNk.......',
      '.....kkkk.......',
    ],
  },
  // A cozy nest with three speckled eggs.
  nest: {
    solid: false,
    sprite: [
      '..kk..kk..kk..',
      '.kUUkkhhkkUUk.',
      '.kUikkhdkkUik.',
      'kkkkkkkkkkkkkk',
      'kdnndnndnndndk',
      '.kdnndnndnndk.',
      '..kkkkkkkkkk..',
    ],
  },
  // A tall perch: a branch on a post for birds to sit on.
  perch: {
    solid: true,
    sprite: [
      '................',
      'kkkkkkkkkkkkkk..',
      'knnnnnnnnnnnnnk.',
      'kkkkkkknkkkkkk..',
      '..kgk.knk.kgk...',
      '..kk..knk..kk...',
      '......knk.......',
      '......knk.......',
      '......knk.......',
      '......knk.......',
      '......knk.......',
      '......knk.......',
      '......knk.......',
      '.....knnnk......',
      '....kNNNNNk.....',
      '....kkkkkkk.....',
    ],
  },
  // A seed feeder hanging on a hook.
  seedFeeder: {
    solid: true,
    sprite: [
      '.....kkkkk......',
      '.....k...k......',
      '.......k........',
      '.....kkkkk......',
      '....kGGGGGk.....',
      '...kkkkkkkkk....',
      '....kUyUyUk.....',
      '....kyUyUyk.....',
      '....kUyUyUk.....',
      '...kkkkkkkkk....',
      '..kGGGGGGGGGk...',
      '...kkkkkkkkk....',
      '.......kn.......',
      '.......kn.......',
      '......kNNk......',
      '......kkkk......',
    ],
  },

  // ---------- REPTILES ----------
  // A glass terrarium with a little rock and a plant inside.
  terrarium: {
    solid: true,
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'kaaaaaaaaaaaaaak',
      'kmwmmmmmmmmglmmk',
      'kmwmmmmmmmglgmmk',
      'kmmmmmmmmmmgmmmk',
      'kmmmmAAAmmmgmmmk',
      'kmmmAaaaAmmgmmmk',
      'kssssssssssssssk',
      'kkkkkkkkkkkkkkkk',
      '.kNk........kNk.',
      '.knk........knk.',
      '.knk........knk.',
      '.kkk........kkk.',
    ],
  },
  // A warm heat lamp on a stand (reptiles love to bask under it).
  heatLamp: {
    solid: true,
    sprite: [
      '...kkkkkkk......',
      '..kAAAAAAAk.....',
      '.kAAAAAAAAAk....',
      '.kkkkkkkkkkk....',
      '..kOyyyyyOk.....',
      '...kOOOOOk......',
      '.....kkkkk......',
      '......kAk.......',
      '......kAk.......',
      '......kAk.......',
      '......kAk.......',
      '......kAk.......',
      '......kAk.......',
      '.....kAAAk......',
      '....kAAAAAk.....',
      '....kkkkkkk.....',
    ],
  },
  // A hollow log to hide in.
  logPile: {
    solid: true,
    sprite: [
      '..kkkkkkkkkkkk..',
      '.knnnnnnnnnnkdk.',
      'knnNnnnnnNnkdNdk',
      'knnnnnNnnnnkdkdk',
      'knNnnnnnnNnkdNdk',
      '.knnnnnnnnnnkdk.',
      '..kkkkkkkkkkkk..',
    ],
  },
  // A clutch of speckled eggs in the warm sand.
  eggClutch: {
    solid: false,
    sprite: [
      '...kk..kk....',
      '..kwwkkwhk...',
      '..kwhkkwwk.k.',
      '.kkwwkkkkkkhk',
      'kssskkwwksskk',
      'ksssskwhkssss',
      '.kkkkkkkkkkk.',
    ],
  },
};
