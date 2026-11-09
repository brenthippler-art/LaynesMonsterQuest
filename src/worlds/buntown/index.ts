import { makeBuildingWorld } from '../building';
import { ALLEY } from './decor/alley';
import { COUNTER_GRILL } from './decor/counterGrill';
import { FREEZER_DINING } from './decor/freezerDining';
import { FRIES_SODA } from './decor/friesSoda';
import { PLAY_DRIVE } from './decor/playDrive';
import { BUNTOWN_MAPS, LEGEND } from './layout';
import { BUNTOWN_REALMS } from './realms';
import { BUNTOWN_SCENE } from './scene';
import { BUNTOWN_TILES } from './tiles';

/**
 * Bun Town Burgers: a big, busy burger restaurant (an original one: its own
 * smiling-bun sign, no real logos, mascots or menu names). The restaurant, the
 * drive-thru lane, the parking lot and the back alley are one map; the walk-in
 * freezer (the big metal door in the grill) is a small extra map. Layne starts
 * just inside the front doors.
 */
export const BUNTOWN = makeBuildingWorld({
  id: 'buntown',
  name: 'Bun Town Burgers',
  seed: 5150,
  scene: BUNTOWN_SCENE,
  tiles: BUNTOWN_TILES,
  decor: { ...COUNTER_GRILL, ...FRIES_SODA, ...FREEZER_DINING, ...PLAY_DRIVE, ...ALLEY },
  legend: LEGEND,
  maps: BUNTOWN_MAPS,
  realms: BUNTOWN_REALMS,
});
