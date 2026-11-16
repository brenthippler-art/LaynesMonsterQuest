import { NES } from '../../render/nesPalette';
import { Tile } from '../../world/tiles';
import { type TileMap } from '../../world/tilemap';
import { groundY } from '../ground';
import { type MeshBuilder, place, rgb } from '../meshBuilder';
import { SHAPES } from '../shapes';

/**
 * Doors between maps. On the island these are cave mouths: a dark arch in the
 * cliff, with a rocky frame. Inside a cave, the way out is a glowing archway,
 * so Layne can always spot it. (Both sit on the NORTH side of their tile, against
 * the rock, the same way the flat map draws them.)
 */
const DARK = rgb(NES.black);
const FRAME = rgb(NES.gray);
const DAYLIGHT = rgb(NES.yellowLight);

export function addDoorway(map: TileMap, x: number, y: number, lit: MeshBuilder, glow: MeshBuilder): void {
  const t = map.tiles[y * map.width + x];
  const cx = x + 0.5;
  const z = y + 0.12;
  const h = groundY(map, cx, y + 0.5);
  const mouth = t === Tile.CaveExit ? glow : lit;
  const inside = t === Tile.CaveExit ? DAYLIGHT : DARK;
  // The opening: a half-disc standing up, facing south (toward the camera's usual side).
  mouth.add(SHAPES.dome(8), place(cx, h, z, 0.45, 0.75, 0.12), inside);
  // Rocks around it, so it reads as a doorway from far away.
  for (const [dx, dy, k] of [[-0.5, 0.15, 0.22], [0.5, 0.15, 0.22], [-0.38, 0.6, 0.2], [0.38, 0.6, 0.2], [0, 0.85, 0.22]] as const) {
    lit.add(SHAPES.rock(), place(cx + dx, h + dy, z + 0.02, k, k, k * 0.8, dx * 3, dy * 2), FRAME);
  }
}
