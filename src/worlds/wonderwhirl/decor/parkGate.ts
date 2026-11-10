import { type DecorKind } from '../../building/types';

/**
 * Things all over the park, and at the front gate (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 *   m mint  t teal  i periwinkle  e rose  h skin
 */
export const PARK_GATE: Record<string, DecorKind> = {
  // A round, leafy park tree.
  tree: {
    solid: true,
    sprite: [
      '....kkkkkkk.....',
      '..kklllgggkk....',
      '.klllggggggGk...',
      'kllgggggggGGGk..',
      'klggPgggggGGGk..',
      'kgggggggPgGGGGk.',
      'kGggggggggGGGGk.',
      '.kGggPggggGGGk..',
      '..kGGggGGGGGk...',
      '...kkGGGGGkk....',
      '.....kknkk......',
      '......knk.......',
      '......knk.......',
      '......knk.......',
      '.....kNnNk......',
      '......kkk.......',
    ],
  },
  // An old-fashioned park lamp: a round glowing globe on a dark green post.
  lampPost: {
    solid: true,
    sprite: [
      '.....kkkk.....',
      '....kyyyyk....',
      '...kyywyyyk...',
      '...kyyyyyYk...',
      '....kYYYYk....',
      '.....kGGk.....',
      '......kG......',
      '......kG......',
      '......kG......',
      '......kG......',
      '......kG......',
      '......kG......',
      '......kG......',
      '.....kGGGk....',
      '....kGGGGGk...',
      '....kkkkkkk...',
    ],
  },
  // A green park bench.
  bench: {
    solid: true,
    place: 'any',
    sprite: [
      '................',
      '.kkkkkkkkkkkkkk.',
      '.kggggggggggggk.',
      '.kkkkkkkkkkkkkk.',
      '.kggggggggggggk.',
      '.kkkkkkkkkkkkkk.',
      'kggggggggggggggk',
      'kGGGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkkkk',
      '.kAk........kAk.',
      '.kAk........kAk.',
      '.kkk........kkk.',
    ],
  },
  // A ticket booth: a little stand with a striped roof and a window.
  ticketBooth: {
    solid: true,
    sprite: [
      '.....kkkkkk.....',
      '...kkrwrwrwkk...',
      '.kkrwrwrwrwrwkk.',
      'krwrwrwrwrwrwrwk',
      'kkkkkkkkkkkkkkkk',
      '.kYYYYYYYYYYYYk.',
      '.kYkkkkkkkkkkYk.',
      '.kYkUUUUUUUUkYk.',
      '.kYkUwUUUUUUkYk.',
      '.kYkUUUUUUUUkYk.',
      '.kYkkkkkkkkkkYk.',
      '.kYYYYYYYYYYYYk.',
      '.krrrrrrrrrrrrk.',
      '.krrrryyyyrrrrk.',
      '.krrrrrrrrrrrrk.',
      '.kkkkkkkkkkkkkk.',
    ],
  },
  // A turnstile: a shiny post with three arms that turn as you walk through.
  turnstile: {
    solid: true,
    sprite: [
      '.....kkkk.....',
      '....kaaaak....',
      '....kawwak....',
      'kkkkkaaaakkkkk',
      'kaaaaaaaaaaaak',
      'kkkkkaaaakkkkk',
      '.....kaaak....',
      '.....kAAAk....',
      '.....kAAAk....',
      '.....kAAAk....',
      '.....kAAAk....',
      '.....kAAAk....',
      '....kAAAAAk...',
      '....kkkkkkk...',
    ],
  },
  // A balloon cart: a little wagon with a bunch of balloons tied to it.
  balloonCart: {
    solid: true,
    sprite: [
      '...kk..kk..kk...',
      '..krrkkuukkYYk..',
      '..krwkkuwkkYwk..',
      '..krrkkuukkYYk..',
      '...kk.kPPk.kk...',
      '....k.kPwk.k....',
      '.....kkPPkk.....',
      '......kkkk......',
      '.......kk.......',
      '.kkkkkkkkkkkkkk.',
      '.kbbbbbbbbbbbbk.',
      '.kbwbwbwbwbwbwk.',
      '.kbbbbbbbbbbbbk.',
      '.kkkkkkkkkkkkkk.',
      '..kAk......kAk..',
      '...k........k...',
    ],
  },
  // The park map board: a big colorful map on two legs (the dot says "you are here").
  mapBoard: {
    solid: true,
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'knlllllluuuuuunk',
      'knllPPlluuYYuunk',
      'knllPPllssuuuunk',
      'knsssssssssssunk',
      'knllYYllssggggnk',
      'knlllllrrsggggnk',
      'knllllrrrsgrrgnk',
      'knnnnnnnnnnnnnnk',
      'kkkkkkkkkkkkkkkk',
      '..kn........nk..',
      '..kn........nk..',
      '..kn........nk..',
      '.kNNk......kNNk.',
      '.kkkk......kkkk.',
    ],
  },
  // A bunch of balloons tied to a little weight.
  balloonPost: {
    solid: true,
    sprite: [
      '...kkk..kkk.....',
      '..kPPPkkuuuk....',
      '..kPwPkkuwuk....',
      '..kPPPkkuuuk....',
      '...kkkkYYYkk....',
      '....k.kYwYk.....',
      '....k.kYYYk.....',
      '.....k.kkk......',
      '.....k..k.......',
      '......k.k.......',
      '......kk........',
      '......k.........',
      '......k.........',
      '.....kAk........',
      '....kAAAk.......',
      '....kkkkk.......',
    ],
  },
};
