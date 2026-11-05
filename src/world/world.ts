import { generateOverworld } from './overworld';
import { type Door, type TileMap } from './tilemap';

/** All the maps in the game, and which one Layne is on right now. */
export class World {
  readonly maps = new Map<string, TileMap>();
  readonly spawn: { x: number; y: number };
  current: TileMap;

  constructor(seed: number) {
    const { map, caves, spawn } = generateOverworld(seed);
    this.maps.set(map.id, map);
    for (const cave of caves) this.maps.set(cave.id, cave);
    this.current = map;
    this.spawn = spawn;
  }

  /** Switch to the map a door leads to. */
  goThrough(door: Door): void {
    const next = this.maps.get(door.toMap);
    if (next) this.current = next;
  }
}
