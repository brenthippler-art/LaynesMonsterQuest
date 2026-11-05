import { hash2 } from '../core/rng';
import { Biome } from './biomes';
import { Tile } from './tiles';
import { inBounds, type TileMap } from './tilemap';

const RADIUS = 12;
const EDGE_MARGIN = 28;

/**
 * Put ONE volcano on the hottest, highest spot that isn't near the coast.
 * Rings from the middle out: lava crater (can't walk in) → dark rock → grey ash.
 */
export function stampVolcano(map: TileMap, elev: Float32Array, temp: Float32Array): void {
  let best = -Infinity;
  let cx = map.width >> 1;
  let cy = map.height >> 1;
  for (let y = EDGE_MARGIN; y < map.height - EDGE_MARGIN; y += 2) {
    for (let x = EDGE_MARGIN; x < map.width - EDGE_MARGIN; x += 2) {
      const i = y * map.width + x;
      if (elev[i] < 0.4) continue;
      const score = temp[i] * 1.2 + elev[i];
      if (score > best) {
        best = score;
        cx = x;
        cy = y;
      }
    }
  }

  for (let y = cy - RADIUS - 1; y <= cy + RADIUS + 1; y++) {
    for (let x = cx - RADIUS - 1; x <= cx + RADIUS + 1; x++) {
      if (!inBounds(map, x, y)) continue;
      // A little randomness on the distance makes the edge wobbly instead of a perfect circle.
      const d = Math.hypot(x - cx, y - cy) + (hash2(x, y, 7) - 0.5) * 1.5;
      if (d > RADIUS) continue;
      const i = y * map.width + x;
      map.biome[i] = Biome.Volcano;
      map.tiles[i] = d < 2.6 ? Tile.Lava : d < 7 ? Tile.VolcanoRock : Tile.Ash;
    }
  }
}
