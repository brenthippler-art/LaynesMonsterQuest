import { WORLD_SEED } from '../../config';
import { type Biome } from '../../world/biomes';
import { hilltopLookouts, walkableFrom } from '../../world/lookouts';
import { generateOverworld } from '../../world/overworld';
import { Tile } from '../../world/tiles';
import { inBounds, indexOf, type TileMap } from '../../world/tilemap';
import { type RealmDef, type WorldDef } from '../types';
import { ISLAND_REALMS } from './realms';
import { ISLAND_SCENE } from './scene';

/**
 * The first world: the big island from src/world/ (overworld.ts + 6 caves).
 * Its maps keep their original ids ('overworld', 'cave-1'...) so old saves work.
 */
const REALM_OF_BIOME = new Map<Biome, RealmDef>(ISLAND_REALMS.map((r) => [r.biome, r]));

export const ISLAND: WorldDef = {
  id: 'island',
  name: 'Island',
  scene: ISLAND_SCENE,
  seed: WORLD_SEED,
  realms: ISLAND_REALMS,
  view: '3d', // the first world converted to the Nintendo 64 style 3D look

  build(seed) {
    const { map, caves, spawn } = generateOverworld(seed);
    // Shallow water can be jumped over (little coves and channels). Deep sea can't.
    map.hops = map.tiles.map((t) => (t === Tile.ShallowWater ? 1 : 0));
    // A monster perches on the highest hilltop of each realm.
    const lives = (i: number) => REALM_OF_BIOME.has(map.biome[i] as Biome);
    map.lookouts = hilltopLookouts(map, walkableFrom(map, spawn), lives, 1.2);
    return {
      maps: [map, ...caves],
      spawn: { map: map.id, x: spawn.x, y: spawn.y },
      // Off the edge of a map counts as ocean, where nobody lives.
      realmAt: (m: TileMap, x: number, y: number) =>
        inBounds(m, x, y) ? (REALM_OF_BIOME.get(m.biome[indexOf(m, x, y)] as Biome) ?? null) : null,
    };
  },
};
