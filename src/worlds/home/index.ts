import { makeBuildingWorld } from '../building';
import { BASEMENT_YARD } from './decor/basementYard';
import { BATH } from './decor/bath';
import { GARAGE_ATTIC } from './decor/garageAttic';
import { KITCHEN_LAUNDRY } from './decor/kitchenLaundry';
import { LIVING_BEDROOM } from './decor/livingBedroom';
import { HOME_MAPS, LEGEND } from './layout';
import { HOME_REALMS } from './realms';
import { HOME_SCENE } from './scene';
import { HOME_TILES } from './tiles';

/**
 * Home Sweet Home: a cozy house with a yard. The ground floor, garage and both
 * yards are one map; the attic (ladder in the hallway) and basement (stairs in
 * the kitchen) are small extra maps. Layne starts on the front path.
 */
export const HOME = makeBuildingWorld({
  id: 'home',
  name: 'Home Sweet Home',
  seed: 4242,
  scene: HOME_SCENE,
  tiles: HOME_TILES,
  decor: { ...KITCHEN_LAUNDRY, ...LIVING_BEDROOM, ...BATH, ...GARAGE_ATTIC, ...BASEMENT_YARD },
  legend: LEGEND,
  maps: HOME_MAPS,
  realms: HOME_REALMS,
});
