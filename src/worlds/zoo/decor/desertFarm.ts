import { type DecorKind } from '../../building/types';

/**
 * The desert and the petting farm (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts (see gateSafari.ts for the list).
 */
export const DESERT_FARM: Record<string, DecorKind> = {
  // ---------- DESERT ----------
  // A friendly cactus with two arms and a pink flower on top (no prickles drawn: it's a soft one!).
  cactus: {
    solid: true,
    sprite: [
      '.......kk.......',
      '......kPPk......',
      '......kggk......',
      '.....kgllgk.....',
      '.kk..kglggk.....',
      'kglk.kglggk..kk.',
      'kglk.kglggk.kglk',
      'kglkkkglggk.kglk',
      '.kgggglgggkkkglk',
      '..kkkkglggggggk.',
      '.....kglggkkkk..',
      '.....kglggk.....',
      '.....kglggk.....',
      '....kddddddk....',
      '....kdOOOOdk....',
      '....kkkkkkkk....',
    ],
  },
  // A big round desert rock.
  desertRock: {
    solid: true,
    sprite: [
      '....kkkkkk....',
      '..kkoooooOkk..',
      '.kooooooOOOOk.',
      'kooowooOOOOOOk',
      'kooooooOOOOOOk',
      'kOOOOOOOOOORRk',
      'kRRRRRRRRRRRRk',
      'kkkkkkkkkkkkkk',
    ],
  },
  // A tumbleweed: a light ball of dry twigs that rolls in the wind.
  tumbleweed: {
    solid: false,
    sprite: [
      '...kkkkk...',
      '.kkd.d.dkk.',
      'kd.dkd.d.dk',
      'k.dd.kdd.dk',
      'kdd.d.dkd.k',
      'k.dkd.d.ddk',
      '.kkd.dd.kk.',
      '...kkkkk...',
    ],
  },
  // A wooden water trough so everyone can have a drink.
  waterTrough: {
    solid: true,
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'knuuuuuuuuuuuunk',
      'knUuuuuuUuuuuunk',
      'knnnnnnnnnnnnnnk',
      'kNnnnnnnnnnnnnNk',
      'kkkkkkkkkkkkkkkk',
      '.kNk........kNk.',
      '.kkk........kkk.',
    ],
  },

  // ---------- FARM ----------
  // A red barn with a white X on its big door.
  barn: {
    solid: true,
    sprite: [
      '......kkkk......',
      '....kkRRRRkk....',
      '..kkRRRwwRRRkk..',
      'kkRRRRwkkwRRRRkk',
      'kRRRRRRwwRRRRRRk',
      'kwwwwwwwwwwwwwwk',
      'krrrrrrrrrrrrrrk',
      'krrkwwwwwwwwkrrk',
      'krrkwkrrrrkwkrrk',
      'krrkrwkrrkwrkrrk',
      'krrkrrwkkwrrkrrk',
      'krrkrrkwwkrrkrrk',
      'krrkrkwrrwkrkrrk',
      'krrkkwrrrrwkkrrk',
      'krrkwwwwwwwwkrrk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A square bale of hay.
  hayBale: {
    solid: true,
    sprite: [
      'kkkkkkkkkkkkkk',
      'kyyyYyyyyYyyyk',
      'kYyyyyYyyyyYyk',
      'knnnnnnnnnnnnk',
      'kyYyyyyYyyyyYk',
      'kyyyYyyyyyYyyk',
      'knnnnnnnnnnnnk',
      'kYyyyYyyyyYyyk',
      'kddddddddddddk',
      'kkkkkkkkkkkkkk',
    ],
  },
  // A round orange pumpkin from the farm garden.
  pumpkin: {
    solid: false,
    sprite: [
      '.....kk.....',
      '.....kGk....',
      '..kkkkkkkk..',
      '.kOOOkOOOOk.',
      'kOoOOkOoOOOk',
      'kOoOOkOoOOOk',
      'kOOOOkOOOOOk',
      '.kOOOkOOOOk.',
      '..kkkkkkkk..',
    ],
  },
  // A shiny milk can.
  milkCan: {
    solid: true,
    sprite: [
      '...kkkkkk...',
      '..kaaaaaak..',
      '...kaaaak...',
      '..kkaaaakk..',
      '.kaaawaaaAk.',
      '.kaaawaaaAk.',
      '.kbbbbbbbbk.',
      '.kaaaaaaaAk.',
      '.kaaaaaaaAk.',
      '.kaaaaaaaAk.',
      '.kAAAAAAAAk.',
      '..kkkkkkkk..',
    ],
  },
};
