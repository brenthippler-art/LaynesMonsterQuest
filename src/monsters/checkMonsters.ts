import { type WorldDef } from '../worlds/types';
import { type WorldId } from '../worlds/worldIds';
import { type Monster } from './monsterTypes';
import { checkMonsterText, checkRealmLooks, checkRealmMix } from './newWorldRules';

const REALMS_PER_WORLD = 9;
const PER_REALM = 12;
const RARE_PER_REALM = 2;
/**
 * Worlds made before the newer rules: they may have FEWER than 2 rare per realm, and skip
 * the extra rules in newWorldRules.ts (creature mix, name and text lengths).
 */
const AT_MOST_RARE: WorldId[] = ['island'];
const MAX_ABILITY_WORDS = 12;

const ID_RULE = /^[a-z][a-z-]*$/;
const sentences = (text: string) => text.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;

export interface CheckReport {
  /** Problems that involve more than one world (ids, names). */
  across: string[];
  /** Problems inside each world. */
  perWorld: { world: WorldDef; problems: string[] }[];
}

/** Check every world and every monster. Empty lists everywhere = all good. */
export function checkAllWorlds(worlds: WorldDef[], monsters: Monster[]): CheckReport {
  const across: string[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const m of monsters) {
    if (!ID_RULE.test(m.id)) across.push(`"${m.id}": ids must be lowercase letters and dashes.`);
    if (ids.has(m.id)) across.push(`Two monsters use the id "${m.id}".`);
    if (names.has(m.name.toLowerCase())) across.push(`Two monsters are named "${m.name}".`);
    if (!worlds.some((w) => w.id === m.world)) across.push(`${m.name}: unknown world "${m.world}".`);
    ids.add(m.id);
    names.add(m.name.toLowerCase());
  }
  across.push(...nearNames(monsters));
  const perWorld = worlds.map((world) => ({ world, problems: checkWorld(world, monsters.filter((m) => m.world === world.id)) }));
  return { across, perWorld };
}

/** Rules inside one world: its realms, and the monsters that live there. */
function checkWorld(world: WorldDef, list: Monster[]): string[] {
  const problems: string[] = [];

  if (world.realms.length !== REALMS_PER_WORLD) problems.push(`Has ${world.realms.length} realms (should be ${REALMS_PER_WORLD}).`);
  const realmIds = new Set<string>();
  for (const r of world.realms) {
    if (!ID_RULE.test(r.id)) problems.push(`Realm "${r.id}": ids must be lowercase letters and dashes.`);
    if (realmIds.has(r.id)) problems.push(`Two realms use the id "${r.id}".`);
    if (!/^[A-Z]+$/.test(r.label)) problems.push(`Realm "${r.id}": the label should be ONE uppercase word.`);
    realmIds.add(r.id);

    const here = list.filter((m) => m.habitat === r.id);
    const rare = here.filter((m) => m.rarity === 'rare').length;
    if (here.length !== PER_REALM) problems.push(`${r.label} has ${here.length} monsters (should be ${PER_REALM}).`);
    problems.push(...checkRealmLooks(r.label, here));
    if (AT_MOST_RARE.includes(world.id)) {
      if (rare > RARE_PER_REALM) problems.push(`${r.label} has ${rare} rare monsters (max ${RARE_PER_REALM}).`);
    } else {
      if (rare !== RARE_PER_REALM) problems.push(`${r.label} has ${rare} rare monsters (should be exactly ${RARE_PER_REALM}).`);
      problems.push(...checkRealmMix(r.label, here));
    }
  }

  const abilities = new Set<string>();
  for (const m of list) {
    if (!realmIds.has(m.habitat)) problems.push(`${m.name}: "${m.habitat}" isn't one of this world's realms.`);
    const ability = m.ability.name.toLowerCase();
    if (abilities.has(ability)) problems.push(`Two monsters have the ability "${m.ability.name}".`);
    abilities.add(ability);
    if (sentences(m.fact) > 1) problems.push(`${m.name}: the fact should be one sentence.`);
    if (!AT_MOST_RARE.includes(world.id)) problems.push(...checkMonsterText(m));
    const d = m.ability.description;
    if (sentences(d) > 1 || d.split(/\s+/).length > MAX_ABILITY_WORDS) {
      problems.push(`${m.name}: the ability description should be one short sentence (${MAX_ABILITY_WORDS} words max).`);
    }
  }
  return problems;
}

/**
 * Names a kid could mix up: two names that differ by just ONE letter (one letter changed,
 * added or taken away), like Twiggle and Twigglet. Checked across ALL worlds.
 */
function nearNames(monsters: Monster[]): string[] {
  const problems: string[] = [];
  const names = monsters.map((m) => m.name.toLowerCase());
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (oneLetterApart(names[i], names[j])) {
        problems.push(`${monsters[i].name} (${monsters[i].world}) and ${monsters[j].name} (${monsters[j].world}) are only one letter apart.`);
      }
    }
  }
  return problems;
}

/** True if a and b differ by exactly one changed, added or removed letter. */
export function oneLetterApart(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  while (i < short.length && short[i] === long[i]) i++; // skip the matching start
  // Same length: the rest must match after one changed letter. One longer: after one extra letter.
  return short.length === long.length ? short.slice(i + 1) === long.slice(i + 1) : short.slice(i) === long.slice(i + 1);
}
