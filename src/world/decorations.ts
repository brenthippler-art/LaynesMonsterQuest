import { hash2 } from '../core/rng';
import { Tile } from './tiles';
import { type TileMap } from './tilemap';

/** Little things drawn on top of the ground. Layne can walk past all of them. */
export const Decor = {
  None: 0,
  Tree: 1,
  Pine: 2,
  SnowPine: 3,
  Palm: 4,
  Cactus: 5,
  Rock: 6,
  SnowDrift: 7,
  TallGrass: 8,
  Flower: 9,
  Bush: 10,
  LavaCrack: 11,
  Reeds: 12,
  Puddle: 13,
  Crystal: 14,
  Mushroom: 15,
  Pebbles: 16,
  Shell: 17,
} as const;
export type Decor = (typeof Decor)[keyof typeof Decor];

/** For each ground tile: which decorations can appear, and how often (0.1 = 10% of squares). */
const CHANCES: Partial<Record<Tile, [Decor, number][]>> = {
  [Tile.Grass]: [[Decor.TallGrass, 0.12], [Decor.Flower, 0.06], [Decor.Bush, 0.02], [Decor.Tree, 0.03], [Decor.Rock, 0.015]],
  [Tile.Savannah]: [[Decor.TallGrass, 0.16], [Decor.Bush, 0.02], [Decor.Tree, 0.015], [Decor.Rock, 0.01]],
  [Tile.ForestFloor]: [[Decor.Tree, 0.28], [Decor.Pine, 0.1], [Decor.Bush, 0.05], [Decor.Mushroom, 0.03], [Decor.Flower, 0.02]],
  [Tile.Desert]: [[Decor.Cactus, 0.05], [Decor.Rock, 0.025], [Decor.Pebbles, 0.03]],
  [Tile.Snow]: [[Decor.SnowDrift, 0.08], [Decor.SnowPine, 0.05], [Decor.Rock, 0.015]],
  [Tile.Mountain]: [[Decor.Rock, 0.12], [Decor.Pebbles, 0.06]],
  [Tile.Sand]: [[Decor.Shell, 0.03], [Decor.Pebbles, 0.02], [Decor.Palm, 0.025]],
  [Tile.Swamp]: [[Decor.Reeds, 0.14], [Decor.Puddle, 0.08], [Decor.Mushroom, 0.03], [Decor.Tree, 0.04]],
  [Tile.Ash]: [[Decor.LavaCrack, 0.1], [Decor.Rock, 0.05], [Decor.Pebbles, 0.05]],
  [Tile.VolcanoRock]: [[Decor.LavaCrack, 0.25], [Decor.Rock, 0.06]],
  [Tile.CaveFloor]: [[Decor.Crystal, 0.04], [Decor.Mushroom, 0.04], [Decor.Rock, 0.04], [Decor.Pebbles, 0.04]],
};

function pickDecor(tile: Tile, x: number, y: number, seed: number): Decor {
  const roll = hash2(x, y, seed);
  let total = 0;
  for (const [decor, chance] of CHANCES[tile] ?? []) {
    total += chance;
    if (roll < total) return decor;
  }
  return Decor.None;
}

/** Sprinkle decorations over a whole map. Door squares stay clear. */
export function decorateMap(map: TileMap, seed: number): void {
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const i = y * map.width + x;
      map.decor[i] = map.doors.has(i) ? Decor.None : pickDecor(map.tiles[i] as Tile, x, y, seed);
    }
  }
}
