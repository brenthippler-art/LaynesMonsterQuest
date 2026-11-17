import { type DecorKind } from '../../building/types';
import { PARK_GATE } from '../../wonderwhirl/decor/parkGate';
import { WHEEL_SNACKS } from '../../wonderwhirl/decor/wheelSnacks';

/**
 * Things all over the zoo, at the front gate, and on the safari (pixel art, one character = one pixel).
 * Letters are the decoration colors from render/decorArt.ts:
 *   k black  w white  a light gray  A gray  r red  R dark red  O orange  o light orange
 *   Y gold  y light yellow  n brown  N dark brown  u sky  U light blue  b blue  B dark blue
 *   g green  l light green  G dark green  p light pink  P pink  s sand  d ochre  v purple  L lavender
 *   m mint  t teal  i periwinkle  e rose  h skin
 *
 * The tree, lamp post, bench, turnstile, picnic table and bin are borrowed from Wonderwhirl Park
 * (a zoo has the same park things), so they aren't drawn twice.
 */
export const GATE_SAFARI: Record<string, DecorKind> = {
  tree: PARK_GATE.tree,
  lampPost: PARK_GATE.lampPost,
  bench: PARK_GATE.bench,
  turnstile: PARK_GATE.turnstile,
  picnicTable: WHEEL_SNACKS.picnicTable,
  parkBin: WHEEL_SNACKS.parkBin,

  // ---------- GATE ----------
  // The zoo's welcome arch: two green posts and a curved sign with a paw print.
  zooArch: {
    solid: true,
    sprite: [
      '....kkkkkkkk....',
      '..kkGGGGGGGGkk..',
      '.kGGGGyyGGGGGGk.',
      'kGGGGyyyyGGGGGGk',
      'kGGyGyyyyGyGGGGk',
      'kGGGGGGGGGGGGGGk',
      'kkkkkkkkkkkkkkkk',
      'knnk........knnk',
      'knnk........knnk',
      'knnk........knnk',
      'knnk........knnk',
      'knnk........knnk',
      'knnk........knnk',
      'knnk........knnk',
      'kNNk........kNNk',
      'kkkk........kkkk',
    ],
  },
  // A ticket hut with a straw roof and a little window.
  ticketHut: {
    solid: true,
    sprite: [
      '......kkkk......',
      '....kkYYYYkk....',
      '..kkYYdYYdYYkk..',
      'kkYYdYYYYYYdYYkk',
      'kddddddddddddddk',
      '.knnnnnnnnnnnnk.',
      '.knkkkkkkkkkknk.',
      '.knkUUUUUUUUknk.',
      '.knkUwUUUUUUknk.',
      '.knkUUUUUUUUknk.',
      '.knkkkkkkkkkknk.',
      '.knnnnnnnnnnnnk.',
      '.knyyyyyyyyyynk.',
      '.knnnnnnnnnnnnk.',
      '.kNNNNNNNNNNNNk.',
      '.kkkkkkkkkkkkkk.',
    ],
  },
  // The zoo map board: a green map with paths, a blue pond and paw prints.
  zooMap: {
    solid: true,
    sprite: [
      'kkkkkkkkkkkkkkkk',
      'knnnnnnnnnnnnnnk',
      'knllllllsllllunk',
      'knlkklllsllluunk',
      'knlkklllslllllnk',
      'knsssssssssssink',
      'knllllslllkkllnk',
      'knlluuslllkkllnk',
      'knluuuslllllrlnk',
      'knnnnnnnnnnnnnnk',
      'kkkkkkkkkkkkkkkk',
      '..kn........nk..',
      '..kn........nk..',
      '..kn........nk..',
      '.kNNk......kNNk.',
      '.kkkk......kkkk.',
    ],
  },
  // A little stroller with a sun canopy (for tired little explorers).
  stroller: {
    solid: true,
    sprite: [
      '..kkkkkk........',
      '.kppPPppk.......',
      'kpPPpPPPpk......',
      'kPPPPPPPPk......',
      'kkkkkkkkkkkkkk..',
      'kbbbbbbbbbbbbk..',
      'kbwbbbbbbbbbbkkk',
      'kbbbbbbbbbbbbk.k',
      '.kbbbbbbbbbbk..k',
      '..kkkkkkkkkk...k',
      '...k......k.....',
      '..kAk....kAk....',
      '.kAaAk..kAaAk...',
      '..kAk....kAk....',
      '...k......k.....',
    ],
  },

  // ---------- SAFARI ----------
  // An umbrella-shaped savanna tree with a wide flat top.
  acacia: {
    solid: true,
    sprite: [
      '................',
      '..kkkkkkkkkkkk..',
      '.kllggggggllggk.',
      'kgggggGgggggggGk',
      'kGGgggGGGgggGGGk',
      '.kkkGGkkkGGGkkk.',
      '....kknk.kkk....',
      '......knk.......',
      '.......nk.......',
      '.......kn.......',
      '.......kn.......',
      '.......kn.......',
      '.......kn.......',
      '......knnk......',
      '.....kNNNNk.....',
      '.....kkkkkk.....',
    ],
  },
  // A clump of tall golden grass to tiptoe through.
  tallGrass: {
    solid: false,
    sprite: [
      '..k.....k...',
      '.kYk...kdk..',
      '.kYk.k.kdk.k',
      '.kYkkYkkdkkY',
      'kdYkYdkkYkYd',
      'kdYkYdkYdkYd',
      'kdYYdYYdYYdk',
      '.kkkkkkkkkk.',
    ],
  },
  // A tall bumpy termite mound, made of red-brown mud.
  termiteMound: {
    solid: true,
    sprite: [
      '......kk........',
      '.....kOOk.......',
      '.....kOok.......',
      '....kOOOk.......',
      '....kOOOOk..kk..',
      '....kOkOOk.kOOk.',
      '...kOOOOOOkkOok.',
      '...kOOOOkOOOOOk.',
      '..kOOkOOOOOkOOk.',
      '..kOOOOOOOOOOOOk',
      '.kOOOOOkOOOOOOOk',
      '.kOOOOOOOOOOkOOk',
      'kRRRRRRRRRRRRRRk',
      'kkkkkkkkkkkkkkkk',
    ],
  },
  // A striped safari jeep for the zoo keepers.
  safariJeep: {
    solid: true,
    sprite: [
      '...kkkkkkkk.....',
      '...kUUkUUUk.....',
      '...kUUkUUUk.....',
      'kkkkkkkkkkkkkkk.',
      'kYYkYYYkYYYkYYYk',
      'kYYkYYYkYYYkYYwk',
      'kYYkYYYkYYYkYYYk',
      'kkkkkkkkkkkkkkkk',
      '.kkk.......kkk..',
      'kAaAk.....kAaAk.',
      '.kkk.......kkk..',
    ],
  },
};
