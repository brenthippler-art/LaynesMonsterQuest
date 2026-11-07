import { Tile } from './tiles';

/**
 * The island's big areas, as stored in its maps. This is an inner detail of the
 * island generator: the rest of the game asks the world for REALMS instead
 * (see worlds/island/realms.ts, which pairs each realm with its biome).
 */
export const Biome = {
  Ocean: 0,
  Beach: 1,
  Grassland: 2,
  Forest: 3,
  Desert: 4,
  Arctic: 5,
  Mountains: 6,
  Swamp: 7,
  Volcano: 8,
  Cave: 9,
} as const;
export type Biome = (typeof Biome)[keyof typeof Biome];

/**
 * Turn three noise values (all roughly 0..1) into a ground tile + biome.
 *   e = elevation   (low = water, high = mountains)
 *   t = temperature (low = snow, high = desert)
 *   m = moisture    (low = dry, high = forest / swamp)
 */
export function classify(e: number, t: number, m: number): [Tile, Biome] {
  const cold = t < 0.3;
  if (e < 0.22) return [Tile.DeepWater, Biome.Ocean];
  if (e < 0.3) return cold ? [Tile.Ice, Biome.Arctic] : [Tile.ShallowWater, Biome.Ocean];
  if (e < 0.34) return cold ? [Tile.Snow, Biome.Arctic] : [Tile.Sand, Biome.Beach];
  if (e > 0.8) return [Tile.Peak, Biome.Mountains];
  if (e > 0.69) return [Tile.Mountain, Biome.Mountains];
  if (cold) return [Tile.Snow, Biome.Arctic];
  if (t > 0.64 && m < 0.46) return [Tile.Desert, Biome.Desert];
  if (m > 0.66 && e < 0.5) return [Tile.Swamp, Biome.Swamp];
  if (m > 0.5) return [Tile.ForestFloor, Biome.Forest];
  return t > 0.55 ? [Tile.Savannah, Biome.Grassland] : [Tile.Grass, Biome.Grassland];
}
