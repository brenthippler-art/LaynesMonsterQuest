import { type BodyShape } from './art/bodies';
import { type Monster } from './monsterTypes';

/**
 * Extra rules for every world made after the island (the island was made
 * before these existed, so it's left as it is). Checked on /gallery.
 *
 * Per realm (12 monsters):
 *   - 2 rare, 4 uncommon, 6 common
 *   - not counting the rares: at least 4 CREATURES and at least 2 living OBJECTS
 *   - at least 5 different body shapes
 * (Every world, the island too: at most 4 round/blob bodies, and no look-alikes. See checkRealmLooks.)
 * Per monster:
 *   - name: one word, a capital then lowercase letters, 2-4 syllables, no "-mon" ending
 *   - ability name 2-3 words; ability description under 12 words; fact one sentence under 15 words
 */
const CREATURE_BODIES: BodyShape[] = ['dragon', 'serpent', 'beast', 'bird', 'long'];
const OBJECT_BODIES: BodyShape[] = ['bowl', 'appliance', 'cart', 'square'];
const BLOB_BODIES: BodyShape[] = ['round', 'blob', 'cloud'];

/** A creature: an animal-shaped body, or a bug (insect wings) or a fish (fish tail) on any body. */
export const isCreature = (m: Monster) => CREATURE_BODIES.includes(m.look.body) || m.look.arms === 'insect' || m.look.tail === 'fish';
/** A living object: a bowl, cup, appliance, cart or box-shaped body. */
export const isObject = (m: Monster) => OBJECT_BODIES.includes(m.look.body);

/** Rough syllable count: groups of vowels, not counting a silent "e" at the end. Good enough for 2-4. */
export function syllables(name: string): number {
  const word = name.toLowerCase();
  let count = (word.match(/[aeiouy]+/g) ?? []).length;
  // A silent "e" after a consonant (Dreamdrake), but not "-le" (Giggle) or "-ee" (Noodlee).
  if (/[^aeiouy]e$/.test(word) && !word.endsWith('le') && count > 1) count--;
  return count;
}

const words = (text: string) => text.trim().split(/\s+/).length;

export function checkRealmMix(label: string, here: Monster[]): string[] {
  const problems: string[] = [];
  const count = (rarity: Monster['rarity']) => here.filter((m) => m.rarity === rarity).length;
  if (count('uncommon') !== 4 || count('common') !== 6) {
    problems.push(`${label}: needs 4 uncommon and 6 common (has ${count('uncommon')} and ${count('common')}).`);
  }
  const plain = here.filter((m) => m.rarity !== 'rare');
  const creatures = plain.filter(isCreature).length;
  const objects = plain.filter(isObject).length;
  const shapes = new Set(here.map((m) => m.look.body)).size;
  if (creatures < 4) problems.push(`${label}: needs at least 4 creatures besides the rares (has ${creatures}).`);
  if (objects < 2) problems.push(`${label}: needs at least 2 living objects besides the rares (has ${objects}).`);
  if (shapes < 5) problems.push(`${label}: needs at least 5 different body shapes (has ${shapes}).`);
  return problems;
}

/**
 * Rules for EVERY world's realms (the island too): at most 4 round/blob bodies, and no two
 * monsters a kid could mix up: the same body shape in the same main color, or in two main
 * colors so close that they look the same on a tablet (light pink and lavender, for example).
 */
export function checkRealmLooks(label: string, here: Monster[]): string[] {
  const problems: string[] = [];
  const blobs = here.filter((m) => BLOB_BODIES.includes(m.look.body)).length;
  if (blobs > 4) problems.push(`${label}: at most 4 round/blob bodies (has ${blobs}).`);
  const seen = new Map<string, string>();
  for (const m of here) {
    const key = `${m.look.body} ${m.colors.main}`;
    const other = seen.get(key);
    if (other) problems.push(`${label}: ${other} and ${m.name} look alike (same body, same main color).`);
    else seen.set(key, m.name);
  }
  for (let i = 0; i < here.length; i++) {
    for (let j = i + 1; j < here.length; j++) {
      const [a, b] = [here[i], here[j]];
      if (a.look.body !== b.look.body || a.colors.main === b.colors.main) continue; // same color: reported above
      if (colorDistance(a.colors.main, b.colors.main) < CLOSE_COLORS) {
        problems.push(`${label}: ${a.name} and ${b.name} look alike (same body, main colors ${a.colors.main} and ${b.colors.main} are too close).`);
      }
    }
  }
  return problems;
}

/**
 * Below this, two main colors look the same at a glance. (Light pink #F8B8F8 and lavender
 * #D8B8F8 are about 55 apart; the closest pairs that still look different are about 90.)
 */
const CLOSE_COLORS = 80;

/**
 * How different two "#RRGGBB" colors look to people (0 = the same, about 765 = black vs white).
 * Plain red/green/blue differences, weighted the way eyes see them ("redmean" formula):
 * green counts most, and red or blue count more depending on how red the colors are.
 */
export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const redMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt((2 + redMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - redMean) / 256) * db * db);
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function checkMonsterText(m: Monster): string[] {
  const problems: string[] = [];
  if (!/^[A-Z][a-z]+$/.test(m.name)) problems.push(`${m.name}: the name should be one word, a capital letter then lowercase.`);
  const s = syllables(m.name);
  if (s < 2 || s > 4) problems.push(`${m.name}: the name should have 2-4 syllables (counted ${s}).`);
  if (/mon$/i.test(m.name)) problems.push(`${m.name}: no "-mon" endings.`);
  const abilityWords = words(m.ability.name);
  if (abilityWords < 2 || abilityWords > 3) problems.push(`${m.name}: the ability name should be 2-3 words.`);
  if (words(m.ability.description) >= 12) problems.push(`${m.name}: the ability description should be under 12 words.`);
  if (words(m.fact) >= 15) problems.push(`${m.name}: the fact should be under 15 words.`);
  return problems;
}
