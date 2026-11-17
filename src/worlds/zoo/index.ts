import { makeBuildingWorld } from '../building';
import { AQUARIUM } from './decor/aquarium';
import { BIRDS_REPTILES } from './decor/birdsReptiles';
import { DESERT_FARM } from './decor/desertFarm';
import { GATE_SAFARI } from './decor/gateSafari';
import { JUNGLE_POLAR } from './decor/junglePolar';
import { LEGEND, ZOO_MAPS } from './layout';
import { ZOO_REALMS } from './realms';
import { ZOO_SCENE } from './scene';
import { ZOO_TILES } from './tiles';

/**
 * The Zoo: a big, friendly zoo in 3D. Layne starts just inside the front gate. Paths
 * lead to nine areas: the safari, the jungle lake, the polar pool, the desert canyon,
 * the petting farm, the bird aviary, the reptile house in the middle, and the aquarium
 * (a little map of its own through its doors, with a glass tunnel and a touch pool).
 *
 * `hops` are the water squares and the canyon: Layne can't walk on them but he can jump
 * over one. Each area has a rock or island one hop from the bank with a gold-ringed
 * lookout on it, where a monster likes to wait.
 */
export const ZOO = makeBuildingWorld({
  id: 'zoo',
  name: 'The Zoo',
  seed: 4242,
  view: '3d',
  scene: ZOO_SCENE,
  tiles: ZOO_TILES,
  decor: { ...GATE_SAFARI, ...JUNGLE_POLAR, ...DESERT_FARM, ...BIRDS_REPTILES, ...AQUARIUM },
  legend: LEGEND,
  maps: ZOO_MAPS,
  realms: ZOO_REALMS,
  hops: ['savannaPond', 'jungleRiver', 'penguinPool', 'canyon', 'duckPond', 'birdPond', 'sealPool'],
});
