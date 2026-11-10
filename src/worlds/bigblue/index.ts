import { makeBuildingWorld } from '../building';
import { AUTO_TOOLS } from './decor/autoTools';
import { FOOD_AISLES } from './decor/foodAisles';
import { PARKING_GARDEN } from './decor/parkingGarden';
import { SPORTS_PETS } from './decor/sportsPets';
import { BIGBLUE_MAPS, LEGEND } from './layout';
import { BIGBLUE_REALMS } from './realms';
import { BIGBLUE_SCENE } from './scene';
import { BIGBLUE_TILES } from './tiles';

/**
 * Big Blue Mart: an enormous blue-and-yellow supercenter (an original one, with its
 * own smiling-shopping-bag sign; no real logos, mascots or brands). One big map,
 * mostly about the outside and edges: a huge parking lot, a fenced garden center
 * on the left, an auto center on the right, and the store behind them. Layne starts
 * at the edge of the lot, looking up the lane at the front doors.
 */
export const BIGBLUE = makeBuildingWorld({
  id: 'bigblue',
  name: 'Big Blue Mart',
  seed: 2828,
  scene: BIGBLUE_SCENE,
  tiles: BIGBLUE_TILES,
  decor: { ...PARKING_GARDEN, ...AUTO_TOOLS, ...FOOD_AISLES, ...SPORTS_PETS },
  legend: LEGEND,
  maps: BIGBLUE_MAPS,
  realms: BIGBLUE_REALMS,
});
