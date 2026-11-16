import { type WildMonster } from '../encounters/wildMonsters';
import { type WorldView } from '../game/worldView';
import { type Point } from '../player/player';
import { type TileMap } from '../world/tilemap';
import { type Camera } from './camera';

/** The flat pixel-art view (looking straight down), as a WorldView. Worlds not yet in 3D use it. */
export class FlatView implements WorldView {
  constructor(private camera: Camera) {}

  snap(x: number, y: number, map: TileMap): void {
    // Aim a little above Layne's feet, so his whole body is centered.
    this.camera.snap(x, y - 0.5, map);
  }

  follow(x: number, y: number, map: TileMap, dt: number): void {
    this.camera.follow(x, y - 0.5, map, dt);
  }

  pick(cssX: number, cssY: number, wild: WildMonster[]): { monster: WildMonster | null; ground: Point | null } {
    const c = this.camera;
    const spot = c.screenToWorld(cssX * c.dpr, cssY * c.dpr);
    // Monsters are drawn standing on their feet, so the body reaches about a tile above (x, y) = feet.
    const monster = wild.find((w) => w.sprite && Math.abs(spot.x - w.x) < 0.75 && spot.y > w.y - 1.3 && spot.y < w.y + 0.4) ?? null;
    return { monster, ground: spot };
  }

  toScreen(x: number, y: number): Point {
    const s = this.camera.toScreen(x, y - 0.6);
    return { x: s.x / this.camera.dpr, y: s.y / this.camera.dpr };
  }

  toWorldDir(input: Point): Point {
    return input; // from straight above, screen up IS map up
  }
}
