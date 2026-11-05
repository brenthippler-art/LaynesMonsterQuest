import { WORLD_SIZE } from '../config';
import { createNoise2D, fbm } from '../core/noise';
import { classify } from './biomes';
import { placeCaves } from './caves';
import { decorateMap } from './decorations';
import { Tile } from './tiles';
import { createMap, isWalkable, doorAt, tileAt, type TileMap } from './tilemap';
import { stampVolcano } from './volcano';

export interface Overworld {
  map: TileMap;
  caves: TileMap[];
  spawn: { x: number; y: number };
}

/** 0 when t <= a, 1 when t >= b, smooth in between. */
function smoothstep(a: number, b: number, t: number): number {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
}

export function generateOverworld(seed: number): Overworld {
  const W = WORLD_SIZE;
  const H = WORLD_SIZE;
  const map = createMap('overworld', 'overworld', W, H, Tile.DeepWater);

  const elevNoise = createNoise2D(seed);
  const tempNoise = createNoise2D(seed + 1);
  const moistNoise = createNoise2D(seed + 2);
  const elev = new Float32Array(W * H);
  const temp = new Float32Array(W * H);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;

      // Distance from the middle (0 = center, ~1 = edge). Push edges down into the ocean.
      const dx = (x / W - 0.5) * 2;
      const dy = (y / H - 0.5) * 2;
      const d = Math.hypot(dx, dy) * 0.5 + Math.max(Math.abs(dx), Math.abs(dy)) * 0.5;
      const falloff = smoothstep(0.72, 1.0, d);

      const e = 0.56 + fbm(elevNoise, x / 55, y / 55, 5) * 0.6 - falloff * 0.8;
      // North is cold, south is hot. High places are colder too.
      const t =
        (y / H) * 0.85 + 0.08 + fbm(tempNoise, x / 60, y / 60, 3) * 0.3 - Math.max(0, e - 0.6) * 0.8;
      const m = 0.5 + fbm(moistNoise, x / 50, y / 50, 4) * 0.7;

      elev[i] = e;
      temp[i] = t;
      const [tile, biome] = classify(e, t, m);
      map.tiles[i] = tile;
      map.biome[i] = biome;
    }
  }

  stampVolcano(map, elev, temp);
  const caves = placeCaves(map, seed);
  decorateMap(map, seed);

  return { map, caves, spawn: findSpawn(map) };
}

/** Start on open grass, as close to the middle of the world as possible. */
function findSpawn(map: TileMap): { x: number; y: number } {
  const cx = Math.floor(map.width / 2);
  const cy = Math.floor(map.height / 2);
  const roomy = (x: number, y: number) => {
    for (let oy = -2; oy <= 2; oy++)
      for (let ox = -2; ox <= 2; ox++)
        if (!isWalkable(map, x + ox, y + oy) || doorAt(map, x + ox, y + oy)) return false;
    return true;
  };
  for (let r = 0; r < map.width / 2; r++) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const onRing = Math.abs(x - cx) === r || Math.abs(y - cy) === r;
        if (onRing && tileAt(map, x, y) === Tile.Grass && roomy(x, y)) return { x, y };
      }
    }
  }
  return { x: cx, y: cy };
}
