import { WORLD_SIZE } from '../../config';
import { hash2 } from '../../core/rng';
import { Decor } from '../../world/decorations';
import { Tile } from '../../world/tiles';
import { createMap, indexOf, isWalkable, type TileMap } from '../../world/tilemap';
import { WoodsBiome } from './realms';
import { addWoodsLandmarks } from './landmarks';

/** Three by three regions, arranged so every realm has a large, explorable area. */
const REGIONS: readonly (readonly WoodsBiome[])[] = [
  [WoodsBiome.Glade, WoodsBiome.Pines, WoodsBiome.Mushroom],
  [WoodsBiome.Fern, WoodsBiome.Creek, WoodsBiome.Briar],
  [WoodsBiome.Ancient, WoodsBiome.Mist, WoodsBiome.Shadow],
];

const chance = (x: number, y: number, seed: number): number => hash2(x, y, seed);
const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

/** Distorted region boundaries avoid a rigid checkerboard look. */
function regionAt(x: number, y: number, w: number, h: number, seed: number): WoodsBiome {
  const wobbleX = (chance(Math.floor(x / 13), Math.floor(y / 13), seed + 17) - 0.5) * Math.min(16, w / 12);
  const wobbleY = (chance(Math.floor(x / 13), Math.floor(y / 13), seed + 29) - 0.5) * Math.min(16, h / 12);
  const col = clamp(Math.floor(((x + wobbleX) / w) * 3), 0, 2);
  const row = clamp(Math.floor(((y + wobbleY) / h) * 3), 0, 2);
  return REGIONS[row][col];
}

function ground(b: WoodsBiome, x: number, y: number, seed: number): Tile {
  const n = chance(x, y, seed + 101);
  switch (b) {
    case WoodsBiome.Glade: return n < 0.76 ? Tile.Grass : Tile.ForestFloor;
    case WoodsBiome.Pines: return n < 0.90 ? Tile.ForestFloor : Tile.Grass;
    case WoodsBiome.Mushroom: return n < 0.88 ? Tile.ForestFloor : Tile.Grass;
    case WoodsBiome.Fern: return n < 0.82 ? Tile.ForestFloor : Tile.Grass;
    case WoodsBiome.Creek: return n < 0.34 ? Tile.Grass : Tile.ForestFloor;
    case WoodsBiome.Briar: return n < 0.84 ? Tile.ForestFloor : Tile.Grass;
    case WoodsBiome.Ancient: return n < 0.93 ? Tile.ForestFloor : Tile.Grass;
    case WoodsBiome.Mist: return n < 0.68 ? Tile.Swamp : Tile.ForestFloor;
    case WoodsBiome.Shadow: return n < 0.94 ? Tile.ForestFloor : Tile.Swamp;
  }
}

/** Pick a single decor item per square; all decor remains walk-through as in Island. */
function decoration(b: WoodsBiome, x: number, y: number, seed: number): Decor {
  const n = chance(x, y, seed + 303);
  const choicesByRealm: Record<WoodsBiome, readonly (readonly [Decor, number])[]> = {
    [WoodsBiome.Glade]: [[Decor.Flower, .18], [Decor.TallGrass, .15], [Decor.Tree, .08], [Decor.Bush, .05]],
    [WoodsBiome.Pines]: [[Decor.Pine, .36], [Decor.Tree, .09], [Decor.Bush, .08], [Decor.Rock, .04]],
    [WoodsBiome.Mushroom]: [[Decor.Mushroom, .24], [Decor.Tree, .25], [Decor.Bush, .09], [Decor.Flower, .05]],
    [WoodsBiome.Fern]: [[Decor.Bush, .25], [Decor.TallGrass, .20], [Decor.Tree, .20], [Decor.Mushroom, .04]],
    [WoodsBiome.Creek]: [[Decor.Reeds, .18], [Decor.Puddle, .12], [Decor.Tree, .13], [Decor.Flower, .08]],
    [WoodsBiome.Briar]: [[Decor.Bush, .34], [Decor.TallGrass, .18], [Decor.Tree, .17], [Decor.Flower, .04]],
    [WoodsBiome.Ancient]: [[Decor.Tree, .46], [Decor.Bush, .12], [Decor.Rock, .08], [Decor.Mushroom, .04]],
    [WoodsBiome.Mist]: [[Decor.Reeds, .22], [Decor.Puddle, .17], [Decor.Mushroom, .12], [Decor.Tree, .11]],
    [WoodsBiome.Shadow]: [[Decor.Pine, .32], [Decor.Tree, .25], [Decor.Mushroom, .10], [Decor.Crystal, .04]],
  };
  const choices = choicesByRealm[b];
  let total = 0;
  for (const [item, probability] of choices) {
    total += probability;
    if (n < total) return item;
  }
  return Decor.None;
}

/** A narrow creek, with crossing points so every part of the map stays accessible. */
function creekAt(x: number, y: number, w: number, h: number, seed: number): boolean {
  const center = w * .50 + Math.sin(y * .067 + seed * .01) * Math.min(8, w * .04);
  const bridge = Math.abs((y % Math.max(12, Math.floor(h / 7))) - 5) <= 2;
  return !bridge && Math.abs(x - center) < 1.3;
}

/** Main trails link the centers of the nine realms. They never become impassable. */
function trailAt(x: number, y: number, w: number, h: number): boolean {
  const xs = [w / 6, w / 2, w * 5 / 6];
  const ys = [h / 6, h / 2, h * 5 / 6];
  // The straight spine keeps every crossing and cave entrance easy to find.
  // Gentle side bends add woodland-looking paths without cutting connections.
  const horizontal = ys.some((cy) => Math.abs(y - cy) <= 1.4);
  const vertical = xs.some((cx) => Math.abs(x - cx) <= 1.4);
  const bendH = ys.some((cy) => Math.abs(y - (cy + Math.sin(x * .065) * 3)) <= .65);
  const bendV = xs.some((cx) => Math.abs(x - (cx + Math.sin(y * .065) * 3)) <= .65);
  return horizontal || vertical || bendH || bendV;
}

export function generateWoods(seed: number): { map: TileMap; spawn: { x: number; y: number } } {
  const size = Math.max(48, WORLD_SIZE);
  const map = createMap('woods/overworld', 'overworld', size, size, Tile.ForestFloor);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = indexOf(map, x, y);
      const realm = regionAt(x, y, size, size, seed);
      map.biome[i] = realm;
      const trail = trailAt(x, y, size, size);
      const creek = creekAt(x, y, size, size, seed);
      map.tiles[i] = trail ? Tile.Grass : creek ? Tile.ShallowWater : ground(realm, x, y, seed);
      map.decor[i] = trail || creek ? Decor.None : decoration(realm, x, y, seed);
    }
  }

  // Each realm has a memorable destination connected to the trail grid.
  addWoodsLandmarks(map);

  // Start in Sunny Glade, on the center of the north-west trail crossing.
  const spawn = { x: Math.floor(size / 6), y: Math.floor(size / 6) };
  const i = indexOf(map, spawn.x, spawn.y);
  map.tiles[i] = Tile.Grass;
  map.decor[i] = Decor.None;
  if (!isWalkable(map, spawn.x, spawn.y)) throw new Error('The Woods spawn is not walkable');
  return { map, spawn };
}
