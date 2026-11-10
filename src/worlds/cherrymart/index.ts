import { makeBuildingWorld } from '../building';
import { DEALS_TOYS } from './decor/dealsToys';
import { GROCERY_BEAUTY } from './decor/groceryBeauty';
import { HOLIDAY } from './decor/holiday';
import { HOME_CLOTHES } from './decor/homeClothes';
import { TECH_CAFE } from './decor/techCafe';
import { CHERRYMART_MAPS, LEGEND } from './layout';
import { CHERRYMART_REALMS } from './realms';
import { CHERRYMART_SCENE } from './scene';
import { CHERRYMART_TILES } from './tiles';

/**
 * Cherry Mart: a big, bright, tidy department store (an original one: its own
 * two-cherries sign, no real logos, mascots or brands). One big map: the sliding
 * doors and cart corral at the bottom, a red racetrack aisle looping through the
 * store, departments all around it, and a cafe by the front. Layne starts just
 * inside the front doors. The holiday aisle changes with the month (season.ts).
 */
export const CHERRYMART = makeBuildingWorld({
  id: 'cherrymart',
  name: 'Cherry Mart',
  seed: 2626,
  scene: CHERRYMART_SCENE,
  tiles: CHERRYMART_TILES,
  decor: { ...DEALS_TOYS, ...HOME_CLOTHES, ...TECH_CAFE, ...GROCERY_BEAUTY, ...HOLIDAY },
  legend: LEGEND,
  maps: CHERRYMART_MAPS,
  realms: CHERRYMART_REALMS,
});
