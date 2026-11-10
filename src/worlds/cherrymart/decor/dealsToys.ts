import { type DecorKind } from '../../building/types';

/**
 * Deals and toys things (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 */
export const DEALS_TOYS: Record<string, DecorKind> = {
  // A red price tag on a stand, with a gold star on it (the DEALS sign: no numbers or words).
  priceSign: {
    solid: true,
    on: ['dealsFloor'],
    place: 'wall',
    sprite: [
      '...kkkkkkkkkkk',
      '..krrrrrrrrrrk',
      '.krrrrrrYrrrrk',
      'krwwrrrYYYrrrk',
      'krwwrrYYYYYrrk',
      '.krrrrrYYYrrrk',
      '..krrrrYrYrrrk',
      '...kkkkkkkkkkk',
      '.......kk.....',
      '.......kk.....',
      '.......kk.....',
      '.....kkkkkk...',
    ],
  },
  // A wire bargain bin heaped with colorful odds and ends.
  bargainBin: {
    solid: true,
    on: ['dealsFloor'],
    place: 'open',
    sprite: [
      '..r.bY.lP.rO..',
      '.YbrlPOYrbllP.',
      'kkkkkkkkkkkkkk',
      'kAaAaAaAaAaAak',
      'kaAaAaAaAaAaAk',
      'kAaAaAaAaAaAak',
      'kaAaAaAaAaAaAk',
      'kkkkkkkkkkkkkk',
      '.kk........kk.',
    ],
  },
  // A red shopping basket with a handle.
  basket: {
    solid: false,
    on: ['dealsFloor'],
    sprite: [
      '..kkkkkkkk..',
      '.k........k.',
      '.k........k.',
      'kkkkkkkkkkkk',
      'krrrrrrrrrrk',
      'krwrwrwrwrrk',
      'krrrrrrrrrrk',
      '.krrrrrrrrk.',
      '..kkkkkkkk..',
    ],
  },
  // A red shopping cart (used in the deals area and the grocery).
  cart: {
    solid: true,
    on: ['dealsFloor', 'groceryFloor', 'lot'],
    place: 'open',
    sprite: [
      'rr..............',
      '.rk.............',
      '..kkkkkkkkkkkkk.',
      '..krwrwrwrwrwrk.',
      '..kwrwrwrwrwrwk.',
      '...krwrwrwrwrk..',
      '...kkkkkkkkkkk..',
      '....A.......A...',
      '..AAAAAAAAAAAA..',
      '...kk......kk...',
    ],
  },
  // The cart corral in the parking lot: a metal rail with carts tucked inside.
  cartCorral: {
    solid: true,
    sprite: [
      'aaaaaaaaaaaaaaaa',
      'a..............a',
      'a.rrrrrrrrrrrr.a',
      'a.rwrwrwrwrwrr.a',
      'a..rrrrrrrrrr..a',
      'a..k..k..k..k..a',
      'aaaaaaaaaaaaaaaa',
      'a..............a',
      'a..............a',
      'A..............A',
    ],
  },
  // The tall sign out front: Cherry Mart's two cherries on a pole.
  cherrySign: {
    solid: true,
    sprite: [
      '..kkkkkkkkkkkk..',
      '.kwwwwwwwwwwwwk.',
      '.kwwwwwgGGwwwwk.',
      '.kwwwwwgwwwwwwk.',
      '.kwwwwgwgwwwwwk.',
      '.kwwwgwwwgwwwwk.',
      '.kwwrrrwwrrrwwk.',
      '.kwwrwrwwrwrwwk.',
      '.kwwrrrwwrrrwwk.',
      '.kwwwRwwwwRwwwk.',
      '.kwwwwwwwwwwwwk.',
      '..kkkkkkkkkkkk..',
      '.......aA.......',
      '.......aA.......',
      '.......aA.......',
      '......kkkk......',
    ],
  },

  // ---------- Toys ----------
  // A tower of wooden toy blocks (the TOYS sign).
  blockTower: {
    solid: true,
    on: ['toysFloor'],
    place: 'open',
    sprite: [
      '....kkkk....',
      '....kYYk....',
      '....kYYk....',
      '..kkkkkkkk..',
      '..kbbkkrrk..',
      '..kbbkkrrk..',
      'kkkkkkkkkkkk',
      'kllkkPPkkOOk',
      'kllkkPPkkOOk',
      'kkkkkkkkkkkk',
    ],
  },
  // A soft teddy bear.
  plushie: {
    solid: false,
    on: ['toysFloor'],
    sprite: [
      '.nn....nn.',
      'nPnnnnnnPn',
      '.nnnnnnnn.',
      '.nnknnknn.',
      '.nnnssnnn.',
      '..nnkknn..',
      '.nnnnnnnn.',
      'nnnssssnnn',
      'nn.ssss.nn',
      '..nn..nn..',
    ],
  },
  toyBall: {
    solid: false,
    on: ['toysFloor'],
    sprite: [
      '..kkkk..',
      '.krrrYk.',
      'krrrYYYk',
      'kwwwwwwk',
      'kbbbbllk',
      'kbbblllk',
      '.kbbllk.',
      '..kkkk..',
    ],
  },
  toyCar: {
    solid: false,
    on: ['toysFloor'],
    sprite: [
      '...kkkkkk...',
      '..kuukruuk..',
      '.krrrrrrrrk.',
      'krrrrrrrrrrk',
      'kYrrrrrrrrOk',
      'kkkkkkkkkkkk',
      '.kak....kak.',
      '..k......k..',
    ],
  },
  // The demo train table: a loop of track with a little train on it.
  trainTable: {
    solid: true,
    on: ['toysFloor'],
    place: 'open',
    sprite: [
      '.kkkkkkkkkkkkkk.',
      'kGGGGGGGGGGGGGGk',
      'kGaarrrkbbbaaaGk',
      'kGaGGGGGGGGGGaGk',
      'kGaGGGGGGGGGGaGk',
      'kGaaaaaaaaaaaaGk',
      'kGGGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkkkk',
      '.kn..........nk.',
      '.kn..........nk.',
      '.kn..........nk.',
      '.kk..........kk.',
    ],
  },
};
