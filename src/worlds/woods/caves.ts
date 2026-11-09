import { hash2 } from '../../core/rng';
import { Decor } from '../../world/decorations';
import { Tile } from '../../world/tiles';
import { addDoor, createMap, indexOf, isWalkable, type TileMap } from '../../world/tilemap';
import { WoodsBiome } from './realms';

/** Each cave belongs to an existing Woods realm; no extra realms are introduced. */
interface CaveSite {
  id: string;
  realm: WoodsBiome;
  col: number;
  row: number;
  feature: Decor;
}
const SITES: readonly CaveSite[] = [
  { id: 'moonroot-grotto', realm: WoodsBiome.Mushroom, col: 2, row: 0, feature: Decor.Mushroom },
  { id: 'whispering-hollow', realm: WoodsBiome.Ancient, col: 0, row: 2, feature: Decor.Crystal },
  { id: 'shadow-den', realm: WoodsBiome.Shadow, col: 2, row: 2, feature: Decor.Crystal },
];

/** The grotto's interior is one connected, irregular chamber with walkable exits. */
function makeCave(site: CaveSite, seed: number): TileMap {
  const w = 35, h = 27;
  const map = createMap(`woods/${site.id}`, 'cave', w, h, Tile.CaveWall);
  const cx = (w - 1) / 2, cy = (h - 1) / 2;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = indexOf(map, x, y);
      map.biome[i] = site.realm;
      // A single star-shaped chamber: every radial segment leads to the middle.
      const angle = Math.atan2(y - cy, x - cx);
      const radius = 1 + 0.09 * Math.sin(angle * 5 + seed) + 0.06 * Math.cos(angle * 9 - seed);
      const distance = Math.hypot((x - cx) / 15, (y - cy) / 11);
      const open = distance < radius;
      map.tiles[i] = open ? Tile.CaveFloor : Tile.CaveWall;
      if (open) {
        const roll = hash2(x, y, seed + site.realm * 101);
        map.decor[i] = roll < .09 ? site.feature : roll < .13 ? Decor.Rock : roll < .16 ? Decor.Pebbles : Decor.None;
      }
    }
  }
  // Door sits inside the chamber, with a clear landing square.
  const exitX = Math.floor(cx), exitY = h - 6;
  for (let y = exitY - 2; y <= exitY + 1; y++) {
    for (let x = exitX - 2; x <= exitX + 2; x++) {
      const i = indexOf(map, x, y);
      map.tiles[i] = Tile.CaveFloor;
      map.decor[i] = Decor.None;
    }
  }
  map.tiles[indexOf(map, exitX, exitY)] = Tile.CaveExit;
  return map;
}

/** Add paired doors to three cave maps, keeping every entrance on a main trail. */
export function addWoodsCaves(overworld: TileMap, seed: number): TileMap[] {
  const caves: TileMap[] = [];
  const size = overworld.width;
  for (const site of SITES) {
    // Trails cross the center of each of the nine regions.
    const x = Math.floor(size * (site.col * 2 + 1) / 6);
    const y = Math.floor(size * (site.row * 2 + 1) / 6);
    // Move a few squares along the horizontal trail, leaving the central crossing free.
    const entryX = Math.min(size - 3, x + 5);
    const entryY = y;
    const i = indexOf(overworld, entryX, entryY);
    overworld.tiles[i] = Tile.CaveEntrance;
    overworld.decor[i] = Decor.None;
    // Keep the cave assigned to its parent realm even at a wobbly region boundary.
    overworld.biome[i] = site.realm;
    const cave = makeCave(site, seed);
    const exitX = Math.floor((cave.width - 1) / 2);
    const exitY = cave.height - 6;
    addDoor(overworld, { x: entryX, y: entryY, toMap: cave.id, toX: exitX, toY: exitY - 1 });
    addDoor(cave, { x: exitX, y: exitY, toMap: overworld.id, toX: entryX, toY: entryY + 1 });
    // Door destinations must always be walkable, even if generation changes later.
    if (!isWalkable(cave, exitX, exitY - 1) || !isWalkable(overworld, entryX, entryY + 1)) {
      throw new Error(`Unsafe cave doorway: ${site.id}`);
    }
    caves.push(cave);
  }
  return caves;
}
