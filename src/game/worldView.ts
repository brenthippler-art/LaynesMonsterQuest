import { type WildMonster } from '../encounters/wildMonsters';
import { type Point } from '../player/player';
import { type TileMap } from '../world/tilemap';

/**
 * How a WorldSession talks to whatever draws the world. There are two:
 *   FlatView   the pixel-art view from above (render/flatView.ts)
 *   View3D     the 3D view with a camera behind Layne (world3d/view3d.ts)
 * The session (walking, monsters, doors, saving) is the same for both.
 * Every position here is in TILES (x across, y down the map), like the rest of the game.
 */
export interface WorldView {
  /** Jump straight to (x, y): at the start, after a door, after the screen changes size. */
  snap(x: number, y: number, map: TileMap): void;
  /** Glide toward (x, y) a little each frame. */
  follow(x: number, y: number, map: TileMap, dt: number): void;
  /** What's under a spot on the screen (CSS pixels): a monster, or a spot on the ground (or nothing, like the sky). */
  pick(cssX: number, cssY: number, wild: WildMonster[]): { monster: WildMonster | null; ground: Point | null };
  /** Where a world spot (Layne's middle) is on the screen, in CSS pixels. */
  toScreen(x: number, y: number): Point;
  /**
   * Keys and fingers say "up / down / left / right" on the SCREEN. Turn that into a
   * direction on the map. (From above they're the same; in 3D it depends on where the camera looks.)
   */
  toWorldDir(input: Point): Point;
}
