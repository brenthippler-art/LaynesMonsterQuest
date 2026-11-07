import { monstersIn } from '../monsters/worlds';
import { type FoundRecord } from '../save/save';
import { type WorldDef } from './types';

/** How much of one world Layne has found (for its world card and the Monster Book). */
export interface WorldProgress {
  found: number;
  total: number;
  /** Realm ids where EVERY monster has been found. */
  realmsDone: Set<string>;
  /** Every monster in the world found (it gets a gold crown). */
  complete: boolean;
}

export function worldProgress(world: WorldDef, collection: Record<string, FoundRecord>): WorldProgress {
  let found = 0;
  let total = 0;
  const realmsDone = new Set<string>();
  for (const realm of world.realms) {
    const list = monstersIn(world.id, realm.id);
    const here = list.filter((m) => collection[m.id]).length;
    found += here;
    total += list.length;
    if (list.length > 0 && here === list.length) realmsDone.add(realm.id);
  }
  return { found, total, realmsDone, complete: total > 0 && found === total };
}
