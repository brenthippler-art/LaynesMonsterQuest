import { type DecorKind } from '../../building/types';
import { SEASON_NOW, type Season } from '../season';

/**
 * The holiday aisle's decorations change with the season (see season.ts).
 * There are always three of them, with the same names all year:
 *   seasonBit    a small thing on the floor (pumpkin, snowflake, heart, flower, beach ball)
 *   seasonBig    a big display (pumpkins on hay, a snowman, heart balloons, tulips, a sandcastle)
 *   seasonShelf  a shelf of round things in the season's two colors
 * Only their pictures change, so the map, the save and everything else stay the same.
 * (Letters: see dealsToys.ts.)
 */
const BIT: Record<Season, string[]> = {
  fall: [
    '...Gk...',
    '..kGk...',
    '.kOOOOk.',
    'kOoOOoOk',
    'kOoOOoOk',
    'kOoOOoOk',
    '.kOOOOk.',
    '..kkkk..',
  ],
  winter: [
    '...w....',
    '.w.w.w..',
    '..www...',
    'wwwUwww.',
    '..www...',
    '.w.w.w..',
    '...w....',
  ],
  hearts: [
    '.rr.rr..',
    'rwrrrrr.',
    'rrrrrrr.',
    '.rrrrr..',
    '..rrr...',
    '...r....',
  ],
  spring: [
    '..f.f...',
    '.fffff..',
    '..fYf...',
    '.fffff..',
    '..fgf...',
    '...g.l..',
    '.l.gl...',
    '..lg....',
  ],
  summer: [
    '..kkkk..',
    '.krwwbk.',
    'krrwwbbk',
    'kYYwwuuk',
    'kYYwwuuk',
    '.kYwwuk.',
    '..kkkk..',
  ],
};

const BIG: Record<Season, string[]> = {
  // A big pumpkin on a hay bale.
  fall: [
    '.....GG.....',
    '.....kG.....',
    '..kkkOOkkk..',
    '.kOOoOOoOOk.',
    'kOOoOOOOoOOk',
    'kOoOOOOOOoOk',
    'kOoOOOOOOoOk',
    'kOOoOOOOoOOk',
    '.kOOoOOoOOk.',
    '..kkkkkkkk..',
    'kdydydydydyk',
    'kydydydydydk',
    'kkkkkkkkkkkk',
  ],
  // A snowman with a red scarf.
  winter: [
    '...kkkkkk...',
    '...kkkkkk...',
    '.kkkkkkkkkk.',
    '..kwwwwwwk..',
    '..kwkwwkwk..',
    '..kwwOOwwk..',
    '...kwwwwk...',
    '..rrrrrrrr..',
    '.kwwwwwwwwk.',
    'kwwwwkkwwwwk',
    'kwwwwwwwwwwk',
    'kwwwwkkwwwwk',
    '.kwwwwwwwwk.',
    '..kkkkkkkk..',
  ],
  // Two heart balloons tied to a little weight.
  hearts: [
    '.rr.rr..PP.PP.',
    'rwrrrrrPwPPPPP',
    'rrrrrrrPPPPPPP',
    '.rrrrr..PPPPP.',
    '..rrr....PPP..',
    '...r......P...',
    '...k......k...',
    '....k....k....',
    '.....k..k.....',
    '......kk......',
    '......kk......',
    '....kkkkkk....',
    '....kAAAAk....',
    '....kkkkkk....',
  ],
  // A pot of tulips.
  spring: [
    '.ff...ff...ff.',
    'ffff.ffff.ffff',
    '.ff...ff...ff.',
    '..g....g...g..',
    '..gl...g..lg..',
    '...g...g..g...',
    '.kkkkkkkkkkkk.',
    '.kOOOOOOOOOOk.',
    '..kOOOOOOOOk..',
    '..kOOOOOOOOk..',
    '...kOOOOOOk...',
    '...kkkkkkkk...',
  ],
  // A sandcastle with two little flags.
  summer: [
    '..r........r..',
    '..k........k..',
    '.kkk......kkk.',
    '.ksk......ksk.',
    '.kskkkkkkkksk.',
    '.kssssssssssk.',
    '.kssskkkksssk.',
    '.ksssNNNNsssk.',
    '.ksssNNNNsssk.',
    '.kkkkkkkkkkkk.',
    'yyyyyyyyyyyyyy',
  ],
};

/** A store shelf; 1 and 2 are swapped for the season's two colors. */
const SHELF = [
  'kkkkkkkkkkkkkkkk',
  'kaaaaaaaaaaaaaak',
  'ka11A22A11A22Aak',
  'ka11A22A11A22Aak',
  'kaaaaaaaaaaaaaak',
  'ka22A11A22A11Aak',
  'ka22A11A22A11Aak',
  'kaaaaaaaaaaaaaak',
  'ka11A22A11A22Aak',
  'ka11A22A11A22Aak',
  'kaaaaaaaaaaaaaak',
  'kkkkkkkkkkkkkkkk',
];
const SHELF_COLORS: Record<Season, [string, string]> = {
  fall: ['O', 'N'],
  winter: ['w', 'u'],
  hearts: ['r', 'P'],
  spring: ['P', 'Y'],
  summer: ['b', 'Y'],
};
const shelfFor = (season: Season) => {
  const [one, two] = SHELF_COLORS[season];
  return SHELF.map((row) => row.replaceAll('1', one).replaceAll('2', two));
};

/** The holiday aisle's three decorations for one season. */
export function holidayDecor(season: Season): Record<string, DecorKind> {
  return {
    seasonBit: { solid: false, on: ['holidayFloor'], sprite: BIT[season] },
    seasonBig: { solid: true, place: 'open', on: ['holidayFloor'], sprite: BIG[season] },
    seasonShelf: { solid: true, place: 'wall', on: ['holidayFloor'], sprite: shelfFor(season) },
  };
}

/** This season's holiday decorations (picked once, when the game loads). */
export const HOLIDAY = holidayDecor(SEASON_NOW);
