import { NES } from './nesPalette';
import { palette } from './pixels';

/**
 * Hand-drawn 16x16 pixel grids for the ground tiles that have a real shape
 * (the rest are drawn with random-looking dots and squiggles in tileArt.ts).
 * Same idea as Layne's sprite: one character = one pixel, '.' = see-through.
 */
export const TILE_PALETTE = palette({
  k: NES.black,
  w: NES.white,
  a: NES.grayLight,
  A: NES.gray,
  u: NES.sky,
  Y: NES.gold,
  l: NES.greenBright,
  g: NES.green,
});

/** A mountain peak with a snowy top. Rows of these make a mountain range. */
export const PEAK = [
  '................',
  '.......kk.......',
  '......kwwk......',
  '.....kwwwak.....',
  '.....kwwaAk.....',
  '....kwakaAAk....',
  '....kaaaAAAk....',
  '...kaaaaAAAAk...',
  '...kaaaAAAAAk...',
  '..kaaaaAAAAAAk..',
  '..kaaaAAAAAAAk..',
  '.kaaaaAAAAAAAAk.',
  '.kaaaAAAAAAAAAk.',
  'kaaaaAAAAAAAAAAk',
  'kaaaAAAAAAAAAAAk',
  'kkkkkkkkkkkkkkkk',
];

/** A dark cave mouth in a stone arch, at the foot of a cliff. */
export const CAVE_ENTRANCE = [
  '................',
  '....kkkkkkkk....',
  '..kkaaaaaaAAkk..',
  '.kaaakkkkkkAAAk.',
  '.kaakkkkkkkkAAk.',
  'kaakkkkkkkkkkAAk',
  'kaakkkkkkkkkkAAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kakkkkkkkkkkkkAk',
  'kkkkkkkkkkkkkkkk',
];

/** The way out of a cave: blue sky, sunshine and grass through the arch. */
export const CAVE_EXIT = [
  '................',
  '....kkkkkkkk....',
  '..kkaaaaaaAAkk..',
  '.kaaauuuuuuAAAk.',
  '.kaauuuuuuuuAAk.',
  'kaauuuuuYYuuuAAk',
  'kaauuuuYYYYuuAAk',
  'kauuuuuYYYYuuuAk',
  'kauuuuuuYYuuuuAk',
  'kauuuuuuuuuuuuAk',
  'kauuuuuuuuuuuuAk',
  'kalllllllllllllk',
  'kalllgllllgllllk',
  'kagglggggglgggAk',
  'kaggggggggggggAk',
  'kkkkkkkkkkkkkkkk',
];
