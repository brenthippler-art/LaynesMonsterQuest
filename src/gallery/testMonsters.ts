import { type Monster, type MonsterData, worldMonsters } from '../monsters/monsterTypes';
import { NES as C } from '../render/nesPalette';

/**
 * TEST monsters for checking the newer parts. They live ONLY in this file,
 * which only the dev /gallery page imports: they're never in the game, the
 * Monster Book, the data checks or a save file.
 * (They borrow the island's grassland so their coloring pages have edge pictures.)
 */
const LIST: MonsterData[] = [
  {
    id: 'test-dragon', name: 'Test Dragon', habitat: 'grassland', type: 'Ember', rarity: 'rare', size: 'large',
    ability: { name: 'Warm Hug', description: 'Gives the coziest warm hugs!' },
    fact: 'A friendly red dragon for testing parts.',
    colors: { main: C.redBright, accent: C.gold, belly: C.sand, wing: C.orange },
    look: { body: 'dragon', eyes: 'round', mouth: 'snout', top: 'dragonhorns', tail: 'dragon', feet: 'claws', arms: 'dragonwings', pattern: 'scales', belly: true, cheeks: true },
  },
  {
    id: 'test-griffin', name: 'Test Griffin', habitat: 'grassland', type: 'Stone', rarity: 'uncommon', size: 'large',
    ability: { name: 'Sky Swoop', description: 'Swoops down in a big friendly loop!' },
    fact: 'A golden griffin for testing parts.',
    colors: { main: C.gold, accent: C.yellowLight, belly: C.sand, feet: C.orange, wing: C.yellowLight },
    look: { body: 'beast', eyes: 'round', mouth: 'beak', top: 'tuft', tail: 'long', feet: 'claws', arms: 'feathers', pattern: 'none', belly: true },
  },
  {
    id: 'test-unicorn', name: 'Test Unicorn', habitat: 'grassland', type: 'Sparkle', rarity: 'rare', size: 'large',
    ability: { name: 'Rainbow Trot', description: 'Leaves a rainbow everywhere it trots!' },
    fact: 'A white unicorn for testing parts.',
    colors: { main: C.white, accent: C.pink, belly: C.lavender, feet: C.gold },
    look: { body: 'beast', eyes: 'big', mouth: 'snout', top: 'unihorn', extraTop: 'mane', tail: 'fluffy', feet: 'hooves', arms: 'none', pattern: 'none', cheeks: true },
  },
  {
    id: 'test-phoenix', name: 'Test Phoenix', habitat: 'grassland', type: 'Ember', rarity: 'rare', size: 'medium',
    ability: { name: 'Sunrise Glow', description: 'Glows like a sunrise when it is happy!' },
    fact: 'An orange phoenix for testing parts.',
    colors: { main: C.orange, accent: C.redBright, belly: C.yellowLight, feet: C.gold, wing: C.orangeLight },
    look: { body: 'bird', eyes: 'round', mouth: 'beak', top: 'flame', tail: 'plume', feet: 'stubs', arms: 'feathers', pattern: 'none', belly: true },
  },
  {
    id: 'test-hydra', name: 'Test Hydra', habitat: 'grassland', type: 'Splash', rarity: 'rare', size: 'large',
    ability: { name: 'Triple Giggle', description: 'All three heads giggle at the same time!' },
    fact: 'A green three-headed hydra for testing parts.',
    colors: { main: C.greenBright, accent: C.green, belly: C.limeLight },
    look: { body: 'serpent', eyes: 'round', mouth: 'smile', top: 'frill', tail: 'none', feet: 'none', arms: 'none', pattern: 'none', belly: true, heads: 3 },
  },
  {
    id: 'test-toilet', name: 'Test Toilet', habitat: 'grassland', type: 'Bubble', rarity: 'common', size: 'medium',
    ability: { name: 'Big Flush', description: 'Makes a giant swirly whoosh sound!' },
    fact: 'A white toilet monster for testing parts.',
    colors: { main: C.white, accent: C.skyLight, belly: C.sky },
    look: { body: 'bowl', eyes: 'big', mouth: 'smile', top: 'lid', tail: 'none', feet: 'none', arms: 'none', pattern: 'none', cheeks: true },
  },
];

export const TEST_MONSTERS: Monster[] = worldMonsters('island', LIST);
