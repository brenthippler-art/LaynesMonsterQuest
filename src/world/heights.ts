import { Biome } from './biomes';
import { Tile } from './tiles';
import { type TileMap } from './tilemap';
import { VOLCANO_RADIUS } from './volcano';

/**
 * Ground heights for the island in 3D, in tiles (1 = as tall as one square is wide).
 *
 * The overworld generator already makes an elevation number for every square
 * (that's what decided water, beach, grass and mountains). Here we turn that
 * same number into a real height, so the hills in 3D line up with the tiles.
 * Nothing about the tiles changes, so saves and the flat view are untouched.
 */
const SEA_ELEVATION = 0.3; // elevation at the shoreline (see classify() in biomes.ts)
const LIFT = 10; // how many tiles high 1.0 of elevation is (bigger = steeper mountains)
const LOWEST_LAND = 0.08; // dry ground always sits a little above the water
const CONE = 0.45; // the volcano rises this much per tile closer to its middle
const CRATER_RIM = 2.6; // same distance volcano.ts uses for the lava

export function overworldHeights(map: TileMap, elev: Float32Array, volcano: { x: number; y: number }): Float32Array {
  const h = new Float32Array(map.width * map.height);
  for (let i = 0; i < h.length; i++) {
    const t = map.tiles[i];
    if (t === Tile.DeepWater) h[i] = -1.4;
    else if (t === Tile.ShallowWater) h[i] = -0.45;
    else h[i] = Math.max(LOWEST_LAND, (elev[i] - SEA_ELEVATION) * LIFT);
  }

  // The volcano: a cone around its middle, with a lava pool sunk into the top.
  const base = h[volcano.y * map.width + volcano.x];
  const rimTop = base + (VOLCANO_RADIUS - CRATER_RIM) * CONE;
  for (let y = volcano.y - VOLCANO_RADIUS; y <= volcano.y + VOLCANO_RADIUS; y++) {
    for (let x = volcano.x - VOLCANO_RADIUS; x <= volcano.x + VOLCANO_RADIUS; x++) {
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue;
      const i = y * map.width + x;
      if (map.biome[i] !== Biome.Volcano) continue;
      const d = Math.hypot(x - volcano.x, y - volcano.y);
      h[i] = map.tiles[i] === Tile.Lava ? rimTop - 1.1 : Math.max(h[i], base) + Math.max(0, VOLCANO_RADIUS - d) * CONE;
    }
  }
  return h;
}
