import { WORLD_SEED } from '../../config';
import { type Biome } from '../../world/biomes';
import { generateOverworld } from '../../world/overworld';
import { inBounds, indexOf, type TileMap } from '../../world/tilemap';
import { type RealmDef, type WorldDef } from '../types';
import { ISLAND_REALMS } from './realms';

/**
 * The first world: the big island from src/world/ (overworld.ts + 6 caves).
 * Its maps keep their original ids ('overworld', 'cave-1'...) so old saves work.
 */
const REALM_OF_BIOME = new Map<Biome, RealmDef>(ISLAND_REALMS.map((r) => [r.biome, r]));

export const ISLAND: WorldDef = {
  id: 'island',
  name: 'Island',
  seed: WORLD_SEED,
  realms: ISLAND_REALMS,
  build(seed) {
    const { map, caves, spawn } = generateOverworld(seed);
    return {
      maps: [map, ...caves],
      spawn: { map: map.id, x: spawn.x, y: spawn.y },
      // Off the edge of a map counts as ocean, where nobody lives.
      realmAt: (m: TileMap, x: number, y: number) =>
        inBounds(m, x, y) ? (REALM_OF_BIOME.get(m.biome[indexOf(m, x, y)] as Biome) ?? null) : null,
    };
  },
};
