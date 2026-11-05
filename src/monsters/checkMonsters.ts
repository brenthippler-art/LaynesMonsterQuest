import { HABITATS, type Monster } from './monsterTypes';

const PER_HABITAT = 12;
const MAX_RARE = 2;

/** Returns a list of problems with the monster data (empty = all good). */
export function checkMonsters(list: Monster[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const m of list) {
    if (!/^[a-z][a-z-]*$/.test(m.id)) problems.push(`"${m.id}": ids must be lowercase letters and dashes.`);
    if (ids.has(m.id)) problems.push(`Two monsters use the id "${m.id}".`);
    if (names.has(m.name.toLowerCase())) problems.push(`Two monsters are named "${m.name}".`);
    ids.add(m.id);
    names.add(m.name.toLowerCase());
    if (m.fact.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length > 1) problems.push(`${m.name}: the fact should be one sentence.`);
  }

  for (const h of HABITATS) {
    const here = list.filter((m) => m.habitat === h.id);
    const rare = here.filter((m) => m.rarity === 'rare').length;
    if (here.length !== PER_HABITAT) problems.push(`${h.label} has ${here.length} monsters (should be ${PER_HABITAT}).`);
    if (rare > MAX_RARE) problems.push(`${h.label} has ${rare} rare monsters (max ${MAX_RARE}).`);
  }
  return problems;
}
