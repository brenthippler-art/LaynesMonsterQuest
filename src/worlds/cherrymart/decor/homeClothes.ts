import { type DecorKind } from '../../building/types';

/** Home and clothes things (letters: see dealsToys.ts). */
export const HOME_CLOTHES: Record<string, DecorKind> = {
  // A floor lamp with a warm yellow shade (the HOME sign).
  lamp: {
    solid: true,
    on: ['homeFloor'],
    sprite: [
      '...kkkkkk...',
      '..kyyyyyyk..',
      '.kyyyyyyyyk.',
      'kyyyyyyyyyyk',
      'kkkkkkkkkkkk',
      '.....kk.....',
      '.....nn.....',
      '.....nn.....',
      '.....nn.....',
      '.....nn.....',
      '...kkkkkk...',
      '..knnnnnnk..',
    ],
  },
  pillow: {
    solid: false,
    on: ['homeFloor'],
    sprite: [
      '.kkkkkkkkkk.',
      'kvLLLLLLLLvk',
      'kLLvLLLLvLLk',
      'kLLLLvvLLLLk',
      'kLLvLLLLvLLk',
      'kvLLLLLLLLvk',
      '.kkkkkkkkkk.',
    ],
  },
  // A striped rug with fringe on the ends.
  rug: {
    solid: false,
    on: ['homeFloor'],
    place: 'open',
    sprite: [
      'w.w.w.w.w.w.w.w.',
      'RRRRRRRRRRRRRRRR',
      'RYYYYYYYYYYYYYYR',
      'RYrrYrrYrrYrrYYR',
      'RYYYYYYYYYYYYYYR',
      'RRRRRRRRRRRRRRRR',
      'w.w.w.w.w.w.w.w.',
    ],
  },
  // A candle in a pink jar.
  candle: {
    solid: false,
    on: ['homeFloor'],
    sprite: [
      '...yy...',
      '..yOOy..',
      '...OO...',
      '...kk...',
      '.kkkkkk.',
      '.kppppk.',
      '.kpPPpk.',
      '.kppppk.',
      '.kkkkkk.',
    ],
  },
  // A picture frame with a sunny hill painted inside.
  pictureFrame: {
    solid: true,
    on: ['homeFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkk',
      'kddddddddddk',
      'kduuuuuuYYdk',
      'kduuuuuuYYdk',
      'kduuuuuuuudk',
      'kdlllluulldk',
      'kdlllllllldk',
      'kddddddddddk',
      'kkkkkkkkkkkk',
    ],
  },

  // ---------- Clothes ----------
  // A clothing rack with shirts in five colors.
  clothesRack: {
    solid: true,
    on: ['clothesFloor'],
    place: 'open',
    sprite: [
      'aaaaaaaaaaaaaaaa',
      'a.k..k..k..k..ka',
      'arrrbbblllPPPYYa',
      'arrrbbblllPPPYYa',
      'arRrbBblLlPpPYya',
      'a..............a',
      'a..............a',
      'kk............kk',
    ],
  },
  // A coat hanger (the CLOTHES sign).
  hanger: {
    solid: false,
    on: ['clothesFloor'],
    sprite: [
      '....kk....',
      '.....k....',
      '....k.....',
      '...aaaa...',
      '.aa....aa.',
      'aaaaaaaaaa',
    ],
  },
  // A fitting room with a purple curtain.
  fittingRoom: {
    solid: true,
    on: ['clothesFloor'],
    place: 'wall',
    sprite: [
      'kkkkkkkkkkkkkk',
      'kaaaaaaaaaaaak',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kvLvLvLvLvLvLk',
      'kkkkkkkkkkkkkk',
    ],
  },
  // A store mannequin in a pink shirt.
  mannequin: {
    solid: true,
    on: ['clothesFloor'],
    sprite: [
      '...kkkk...',
      '...kwwk...',
      '...kwwk...',
      '....kk....',
      '.kkkkkkkk.',
      'kPPPPPPPPk',
      'kPPPPPPPPk',
      '.kPPPPPPk.',
      '..kPPPPk..',
      '..kvvvvk..',
      '..kvvvvk..',
      '..kv..vk..',
      '....kk....',
      '..kkkkkk..',
    ],
  },
};
