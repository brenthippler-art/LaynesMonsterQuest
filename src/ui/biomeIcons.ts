import { DECOR_SPRITES } from '../render/decorSprites';
import { CAVE_ENTRANCE, PEAK } from '../render/tileSprites';
import { Biome } from '../world/biomes';
import { Decor } from '../world/decorations';

/**
 * A pixel-art picture for each biome (up to 16x16), shown in the corner sign.
 * Several reuse the decoration and tile sprites; the rest are drawn here.
 * Letters use the same colors as decorations (see SPRITE_COLORS in render/decorArt.ts).
 */
const WAVES = [
  '................',
  '..uuu.....uuu...',
  '.uUUUu...uUUUu..',
  'uU...Uu.uU...Uu.',
  '.......u.......u',
  '................',
  '..uuu.....uuu...',
  '.uUUUu...uUUUu..',
  'uU...Uu.uU...Uu.',
  '.......u.......u',
];

const FLOWER = [
  '....kk.kk....',
  '...kffkffk...',
  '..kfffkfffk..',
  '.kkkffkffkkk.',
  'kfffkkYkkfffk',
  'kffffYYYffffk',
  '.kkkkkYkkkkk.',
  '..kffkkkffk..',
  '..kfffkfffk..',
  '...kkkgkkk...',
  '...kg.g.gk...',
  '....kgggk....',
  '.....kgk.....',
  '.....kgk.....',
];

const SUN = [
  '.......Y.......',
  '...Y...Y...Y...',
  '....Y.....Y....',
  '.....OOOOO.....',
  '....OYYYYYO....',
  '...OYYYYYYYO...',
  'YY.OYYYYYYYO.YY',
  '...OYYYYYYYO...',
  '...OYYYYYYYO...',
  '....OYYYYYO....',
  '.....OOOOO.....',
  '....Y.....Y....',
  '...Y...Y...Y...',
  '.......Y.......',
];

const SNOWFLAKE = [
  '......w......',
  '...w..w..w...',
  '....w.w.w....',
  '.....www.....',
  '.w...wUw...w.',
  '..w.wUUUw.w..',
  'wwwwwUwUwwwww',
  '..w.wUUUw.w..',
  '.w...wUw...w.',
  '.....www.....',
  '....w.w.w....',
  '...w..w..w...',
  '......w......',
];

const FROG = [
  '..www....www..',
  '.wwkww..wwkww.',
  '.gwwwg..gwwwg.',
  'gggggggggggggg',
  'glggggggggggGg',
  'gggkkkkkkkkggg',
  'ggggrrrrrrgggg',
  '.gggggggggggg.',
  '..gGGg..gGGg..',
  '.ggg......ggg.',
];

const VOLCANO = [
  '......Y..Y......',
  '.....Y.OY.Y.....',
  '.......YO.......',
  '......kOOk......',
  '.....kaOOak.....',
  '.....kaYOak.....',
  '....kaaOaaAk....',
  '....kaaaOaAk....',
  '...kaaaaaaAAk...',
  '...kaaaaaAAAk...',
  '..kaaaaaaAAAAk..',
  '..kaaaaaAAAAAk..',
  '.kaaaaaaAAAAAAk.',
  'kkkkkkkkkkkkkkkk',
];

export const BIOME_ICONS: Record<Biome, readonly string[]> = {
  [Biome.Ocean]: WAVES,
  [Biome.Beach]: DECOR_SPRITES[Decor.Palm]!,
  [Biome.Grassland]: FLOWER,
  [Biome.Forest]: DECOR_SPRITES[Decor.Pine]!,
  [Biome.Desert]: SUN,
  [Biome.Arctic]: SNOWFLAKE,
  [Biome.Mountains]: PEAK,
  [Biome.Swamp]: FROG,
  [Biome.Volcano]: VOLCANO,
  [Biome.Cave]: CAVE_ENTRANCE,
};
