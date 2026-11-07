import { badMapIds } from '../worlds/mapIds';
import { type RealmDef, type SpawnPoint, type WorldDef } from '../worlds/types';
import { type Door, type TileMap } from './tilemap';

/** One world's maps (built from its WorldDef), and which one Layne is on right now. */
export class World {
  readonly maps = new Map<string, TileMap>();
  readonly spawn: SpawnPoint;
  current: TileMap;
  private realmLookup: (map: TileMap, x: number, y: number) => RealmDef | null;

  constructor(readonly def: WorldDef) {
    const built = def.build(def.seed);
    for (const map of built.maps) this.maps.set(map.id, map);
    this.current = this.maps.get(built.spawn.map) ?? built.maps[0];
    this.spawn = built.spawn;
    this.realmLookup = built.realmAt;

    const bad = badMapIds(def.id, [...this.maps.keys()]);
    if (import.meta.env.DEV && bad.length) console.error(`World "${def.id}": map ids must start with "${def.id}/":`, bad);
    if (import.meta.env.DEV && built.problems?.length) console.error(`World "${def.id}" has map problems:`, built.problems);
  }

  /** Which realm a tile belongs to (null = nobody lives there: water, walls...). */
  realmAt(map: TileMap, x: number, y: number): RealmDef | null {
    return this.realmLookup(map, x, y);
  }

  /** Switch to the map a door leads to. */
  goThrough(door: Door): void {
    const next = this.maps.get(door.toMap);
    if (next) this.current = next;
  }
}
