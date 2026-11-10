import { makeBuildingWorld } from '../building';
import { ART_MUSIC } from './decor/artMusic';
import { CLASS_LIBRARY } from './decor/classLibrary';
import { LUNCH_GYM } from './decor/lunchGym';
import { RECESS_BUS } from './decor/recessBus';
import { SCIENCE_HALL } from './decor/scienceHall';
import { LEGEND, SUNNYSIDE_MAPS } from './layout';
import { SUNNYSIDE_REALMS } from './realms';
import { SUNNYSIDE_SCENE } from './scene';
import { SCHOOL_NAME } from './schoolName';
import { SUNNYSIDE_TILES } from './tiles';

/**
 * Sunnyside Elementary: a friendly one-story school (an original one, with its own
 * smiling-sun sign). One big map: the playground out back, a long main hallway
 * with rooms on both sides, and the bus loop out front, where Layne starts.
 * The name lives in schoolName.ts, so it's easy to change.
 */
export const SUNNYSIDE = makeBuildingWorld({
  id: 'sunnyside',
  name: SCHOOL_NAME,
  seed: 2727,
  scene: SUNNYSIDE_SCENE,
  tiles: SUNNYSIDE_TILES,
  decor: { ...CLASS_LIBRARY, ...LUNCH_GYM, ...RECESS_BUS, ...ART_MUSIC, ...SCIENCE_HALL },
  legend: LEGEND,
  maps: SUNNYSIDE_MAPS,
  realms: SUNNYSIDE_REALMS,
});
