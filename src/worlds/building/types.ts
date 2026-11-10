import { type SongName } from '../../audio/tracks';
import { type PixelBuffer } from '../../render/pixels';
import { type WorldId } from '../worldIds';

/**
 * What a building world is made of. A new world is mostly: draw the maps as
 * ASCII templates, then list its tiles, decorations and realms (see worlds/home/).
 */

/** What a tile painter gets: where to paint, and a peek at the neighbors. */
export interface TileCtx {
  buf: PixelBuffer;
  /** The tile's spot on the map (for patterns that change from tile to tile). */
  x: number;
  y: number;
  /** Top-left corner to paint at, in the buffer. */
  ox: number;
  oy: number;
  /** Name of the tile next door (dx, dy = -1, 0 or 1). Off the map = the map's outside tile. */
  near(dx: number, dy: number): string;
}

export interface TileKind {
  /** Can Layne walk on it? (Walls, fences and water: no.) */
  walkable: boolean;
  /** Main color: shown on the corner map. Walls should be dark, so rooms look outlined. */
  color: string;
  /** A gap in a wall between two rooms: furniture is never put on it or right next to it. */
  doorway?: boolean;
  /** Paint the 16x16 tile. */
  draw(c: TileCtx): void;
}

export interface DecorKind {
  /** Pixel art, up to 16x16, letters colored like the island's decorations (render/decorArt.ts). */
  sprite: readonly string[];
  /** Furniture blocks walking; small things (a rug, a sock) don't. */
  solid: boolean;
  /** Where the scatter puts it: against a wall, out in the open, or anywhere (default). */
  place?: 'wall' | 'open' | 'any';
  /** Only on these tiles (tile names), e.g. flowers only on garden soil. Default: any walkable tile. */
  on?: string[];
}

/** What one template character means. */
export interface LegendEntry {
  /** Tile name (a key of the world's tiles). */
  tile: string;
  /** A decoration placed exactly here (hand-placed furniture, like a car or a bed). */
  decor?: string;
  /** Stairs/ladders: the same link name on two maps joins them (like a cave door). */
  link?: string;
  /**
   * Which side of these stairs you appear on when you arrive through them. Pick the side
   * that keeps you walking AWAY: if you climb the ladder by walking up, arrive above the hatch,
   * so holding Up doesn't send you straight back down. (Default: the first free side.)
   */
  arrive?: 'up' | 'down' | 'left' | 'right';
  /** Where Layne starts on his very first visit. */
  spawn?: boolean;
  /** With `spawn`: which way Layne looks when he first arrives (default: down, toward the screen). */
  face?: 'up' | 'down' | 'left' | 'right';
}

export interface MapPlan {
  /** Short name; the map id becomes '<worldId>/<name>'. The FIRST map is the main one. */
  name: string;
  /** One string per row, one character per tile (see the world's legend). */
  rows: string[];
  /**
   * Same size as rows: which realm each tile belongs to, by the realm's zone letter.
   * '.' = no realm (walls, hallways).
   */
  zones: string[];
  /** The tile shown past the map's edges. */
  outside: string;
}

export interface RealmPlan {
  id: string;
  /** ONE short uppercase word for the corner badge. */
  label: string;
  /** Its letter in the zone templates. */
  zone: string;
  /** Badge / book / corner-map icon: the name of one of the world's decorations. */
  icon: string;
  music: SongName;
  /** Scattered around this realm (seeded, so the same every visit): decoration name → how many. */
  scatter: Record<string, number>;
  /** The encounter picture: a back wall, a floor, and a few of the realm's decorations. */
  scene: { wall: string; floor: string; decor: string[] };
  /** Pictures around the edges of this realm's coloring pages (decoration names). */
  printDecor: string[];
  /** Where its icon sits on the corner map (default: the room's middle). */
  labelAt?: { map: string; x: number; y: number };
}

export interface BuildingPlan {
  id: WorldId;
  name: string;
  seed: number;
  scene: readonly string[];
  tiles: Record<string, TileKind>;
  decor: Record<string, DecorKind>;
  legend: Record<string, LegendEntry>;
  maps: MapPlan[];
  realms: RealmPlan[];
}
