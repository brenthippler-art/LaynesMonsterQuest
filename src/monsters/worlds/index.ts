import { type WorldId } from '../../worlds/worldIds';
import { type Monster } from '../monsterTypes';
import { BUNTOWN_MONSTERS } from './buntown';
import { HOME_MONSTERS } from './home';
import { ISLAND_MONSTERS } from './island';
import { WOODS_MONSTERS } from '../data/woods';

/**
 * Every monster from every world, in one list (world by world, in book order).
 * Ids are unique across ALL worlds, so the save can keep one collection.
 * To add a world's monsters: make a file like island.ts and add it here.
 */
export const MONSTERS: Monster[] = [...ISLAND_MONSTERS, ...HOME_MONSTERS, ...WOODS_MONSTERS, ...BUNTOWN_MONSTERS];

/** One world's monsters. */
export function monstersOf(world: WorldId): Monster[] {
  return MONSTERS.filter((m) => m.world === world);
}

/** The monsters of one realm in one world. */
export function monstersIn(world: WorldId, realm: string): Monster[] {
  return MONSTERS.filter((m) => m.world === world && m.habitat === realm);
}
