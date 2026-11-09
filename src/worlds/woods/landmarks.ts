import { Decor } from '../../world/decorations';
import { Tile } from '../../world/tiles';
import { indexOf, type TileMap } from '../../world/tilemap';
import { WoodsBiome } from './realms';

/** Small, recognizable destinations in each realm, all reachable from the trail network. */
interface Landmark {
  realm: WoodsBiome;
  col: number;
  row: number;
  tile: Tile;
  centerpiece: Decor;
  ring: Decor;
}

const LANDMARKS: readonly Landmark[] = [
  { realm: WoodsBiome.Glade, col: 0, row: 0, tile: Tile.Grass, centerpiece: Decor.Flower, ring: Decor.Flower },
  { realm: WoodsBiome.Pines, col: 1, row: 0, tile: Tile.ForestFloor, centerpiece: Decor.Pine, ring: Decor.Pine },
  { realm: WoodsBiome.Mushroom, col: 2, row: 0, tile: Tile.ForestFloor, centerpiece: Decor.Mushroom, ring: Decor.Mushroom },
  { realm: WoodsBiome.Fern, col: 0, row: 1, tile: Tile.Grass, centerpiece: Decor.Bush, ring: Decor.TallGrass },
  { realm: WoodsBiome.Creek, col: 1, row: 1, tile: Tile.Grass, centerpiece: Decor.Reeds, ring: Decor.Flower },
  { realm: WoodsBiome.Briar, col: 2, row: 1, tile: Tile.ForestFloor, centerpiece: Decor.Bush, ring: Decor.Bush },
  { realm: WoodsBiome.Ancient, col: 0, row: 2, tile: Tile.ForestFloor, centerpiece: Decor.Tree, ring: Decor.Rock },
  { realm: WoodsBiome.Mist, col: 1, row: 2, tile: Tile.Swamp, centerpiece: Decor.Puddle, ring: Decor.Reeds },
  { realm: WoodsBiome.Shadow, col: 2, row: 2, tile: Tile.ForestFloor, centerpiece: Decor.Crystal, ring: Decor.Pine },
];

/**
 * A small 11x11 landmark sits off each main trail intersection.
 * A clear spur connects the landmark to the trail; decorative objects never block walking.
 * We keep cave entrances (five tiles east of the intersection) outside the landmark footprint.
 */
export function addWoodsLandmarks(map: TileMap): void {
  for (const site of LANDMARKS) {
    const cx = Math.floor(map.width * (site.col * 2 + 1) / 6);
    const cy = Math.floor(map.height * (site.row * 2 + 1) / 6);
    // Landmark centers are north of the intersection, leaving cave approaches clear.
    const lx = cx;
    const ly = Math.max(7, cy - 9);
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const x = lx + dx;
        const y = ly + dy;
        if (x < 2 || y < 2 || x >= map.width - 2 || y >= map.height - 2) continue;
        const d = Math.hypot(dx, dy);
        if (d > 5.2) continue;
        const i = indexOf(map, x, y);
        map.biome[i] = site.realm;
        map.tiles[i] = site.tile;
        map.decor[i] = d < 1 ? site.centerpiece : d >= 3.5 && ((dx * 7 + dy * 11) % 3 === 0) ? site.ring : Decor.None;
      }
    }
    // Trail spur from the intersection to the landmark, including a clear arrival square.
    for (let y = ly + 1; y <= cy; y++) {
      for (let x = lx - 1; x <= lx + 1; x++) {
        const i = indexOf(map, x, y);
        map.tiles[i] = Tile.Grass;
        map.decor[i] = Decor.None;
        map.biome[i] = site.realm;
      }
    }
  }
}
