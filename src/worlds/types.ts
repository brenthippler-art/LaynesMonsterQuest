import { type SongName } from '../audio/tracks';
import { type TileMap } from '../world/tilemap';
import { type WorldId } from './worldIds';

/**
 * How the encounter screen looks behind the monster's box:
 *   'dim'      the world, darkened (the island)
 *   { scene }  a little pixel picture of the room, filling the screen (building worlds).
 *              scene() is only called the first time it's needed; keep the canvas it returns.
 */
export type EncounterBg = 'dim' | { scene: () => HTMLCanvasElement };

/** One of a world's 9 areas, where 12 of its monsters live. */
export interface RealmDef {
  /** Lowercase, unique inside its world. Monsters' `habitat` is this id. */
  id: string;
  /** ONE short uppercase word for the corner badge and the Monster Book (e.g. 'SNOW'). */
  label: string;
  /** Pixel-art picture (up to 16x16), letters colored like decorations (see render/decorArt.ts). */
  icon: readonly string[];
  /** Music that plays while Layne walks here. */
  music: SongName;
  encounterBg: EncounterBg;
  /** Little pictures sprinkled around the edges of this realm's coloring pages. */
  printDecor: readonly (readonly string[])[];
}

/** Where a world starts: a map id and a tile on it. */
export interface SpawnPoint {
  map: string;
  x: number;
  y: number;
  /** Which way Layne looks on his very first visit (default: down). */
  facing?: 'up' | 'down' | 'left' | 'right';
}

/** Everything build() makes. */
export interface BuiltWorld {
  /** All of the world's maps (see worlds/mapIds.ts for how they're named). */
  maps: TileMap[];
  spawn: SpawnPoint;
  /** Which realm a tile belongs to, or null (open water, walls...). */
  realmAt: (map: TileMap, x: number, y: number) => RealmDef | null;
  /** Problems found while building (e.g. squares Layne can't reach). Shown on /gallery and in the dev console. */
  problems?: string[];
}

export interface WorldDef {
  /** Lowercase and permanent: it's used in save files. */
  id: WorldId;
  /** Short name, shown in big pixel letters on its world card. */
  name: string;
  /**
   * A little pixel-art picture of the world (about 32x18), for its world card
   * and its tab in the Monster Book. Letters are colored like decorations.
   */
  scene: readonly string[];
  /** Same seed = same world, every visit. */
  seed: number;
  /** Exactly 9 (checked on /gallery). */
  realms: readonly RealmDef[];
  build: (seed: number) => BuiltWorld;
}
