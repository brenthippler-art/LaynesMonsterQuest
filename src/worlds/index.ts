import { type Monster } from '../monsters/monsterTypes';
import { HOME } from './home';
import { ISLAND } from './island';
import { type RealmDef, type WorldDef } from './types';
import { type WorldId } from './worldIds';

/**
 * Every world in the game. To add one: put its id in worldIds.ts, make a
 * WorldDef in its own folder (like island/), and list it here.
 */
export const WORLDS: Record<WorldId, WorldDef> = {
  island: ISLAND,
  home: HOME,
};

/** All worlds, in order (for the title screen and /gallery). */
export const WORLD_LIST: WorldDef[] = Object.values(WORLDS);

/** The realm a monster lives in (undefined only if the monster data is wrong; /gallery reports that). */
export function realmOf(m: Monster): RealmDef | undefined {
  return WORLDS[m.world]?.realms.find((r) => r.id === m.habitat);
}
