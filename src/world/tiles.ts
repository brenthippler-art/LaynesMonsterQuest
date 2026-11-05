/**
 * Every kind of ground square in the game. Stored as small numbers so a
 * 200x200 map fits in one compact Uint8Array.
 */
export const Tile = {
  DeepWater: 0,
  ShallowWater: 1,
  Sand: 2,
  Grass: 3,
  Savannah: 4,
  ForestFloor: 5,
  Desert: 6,
  Snow: 7,
  Ice: 8,
  Mountain: 9,
  Peak: 10,
  Swamp: 11,
  Ash: 12,
  VolcanoRock: 13,
  Lava: 14,
  CaveEntrance: 15,
  CaveFloor: 16,
  CaveWall: 17,
  CaveExit: 18,
} as const;
export type Tile = (typeof Tile)[keyof typeof Tile];

interface TileInfo {
  /** Base color of the ground. */
  color: string;
  /** Can Layne walk on it? */
  walkable: boolean;
}

/** Colors are from the NES palette (see render/nesPalette.ts). */
export const TILE_INFO: Record<Tile, TileInfo> = {
  [Tile.DeepWater]: { color: '#0058F8', walkable: false },
  [Tile.ShallowWater]: { color: '#3CBCFC', walkable: false },
  [Tile.Sand]: { color: '#FCE0A8', walkable: true },
  [Tile.Grass]: { color: '#58D854', walkable: true },
  [Tile.Savannah]: { color: '#B8F818', walkable: true },
  [Tile.ForestFloor]: { color: '#00A800', walkable: true },
  [Tile.Desert]: { color: '#F8D878', walkable: true },
  [Tile.Snow]: { color: '#FCFCFC', walkable: true },
  [Tile.Ice]: { color: '#A4E4FC', walkable: true },
  [Tile.Mountain]: { color: '#BCBCBC', walkable: true },
  [Tile.Peak]: { color: '#BCBCBC', walkable: false },
  [Tile.Swamp]: { color: '#00A844', walkable: true },
  [Tile.Ash]: { color: '#7C7C7C', walkable: true },
  [Tile.VolcanoRock]: { color: '#881400', walkable: true },
  [Tile.Lava]: { color: '#F83800', walkable: false },
  [Tile.CaveEntrance]: { color: '#BCBCBC', walkable: true },
  [Tile.CaveFloor]: { color: '#503000', walkable: true },
  [Tile.CaveWall]: { color: '#7C7C7C', walkable: false },
  [Tile.CaveExit]: { color: '#503000', walkable: true },
};

export function isWalkableTile(t: number): boolean {
  return TILE_INFO[t as Tile]?.walkable ?? false;
}
