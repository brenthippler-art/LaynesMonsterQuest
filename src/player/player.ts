import { PLAYER_SPEED } from '../config';
import { isWalkable, type TileMap } from '../world/tilemap';

export type Facing = 'down' | 'up' | 'left' | 'right';
export interface Point {
  x: number;
  y: number;
}

/** Half the size of Layne's "feet box" in tiles. Only his feet bump into things. */
const HALF_W = 0.3;
const HALF_H = 0.2;

export class Player {
  /** World position of Layne's feet, in tiles (x = 10.5 means the middle of column 10). */
  x: number;
  y: number;
  facing: Facing = 'down';
  moving = false;
  private walkTime = 0;
  /** Tiles left to walk through for tap-to-walk. */
  private path: Point[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Which of the 4 walk poses to draw (0 = standing). */
  get walkFrame(): number {
    return this.moving ? Math.floor(this.walkTime * 8) % 4 : 0;
  }

  get hasPath(): boolean {
    return this.path.length > 0;
  }

  setPath(path: Point[]): void {
    this.path = path;
  }

  /** Teleport (used when going through a door). */
  placeAt(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.path = [];
  }

  /**
   * input = direction from the keyboard or a steering finger, each part -1..1.
   * If there's input, it wins and cancels any tap-to-walk path.
   */
  update(dt: number, input: Point, map: TileMap): void {
    let vx = 0;
    let vy = 0;
    const strength = Math.hypot(input.x, input.y);

    if (strength > 0.15) {
      this.path = [];
      const k = Math.min(1, strength) / strength; // full speed at full tilt, slower for a gentle push
      vx = input.x * k;
      vy = input.y * k;
      this.moveWithCollision(vx * PLAYER_SPEED * dt, vy * PLAYER_SPEED * dt, map);
    } else if (this.path.length) {
      // The path only uses walkable squares, so we can head straight for each square's center.
      const next = this.path[0];
      const dx = next.x + 0.5 - this.x;
      const dy = next.y + 0.5 - this.y;
      const dist = Math.hypot(dx, dy);
      const step = PLAYER_SPEED * dt;
      if (dist > 0) {
        vx = dx / dist;
        vy = dy / dist;
      }
      if (dist <= step) {
        this.x = next.x + 0.5;
        this.y = next.y + 0.5;
        this.path.shift();
      } else {
        this.x += vx * step;
        this.y += vy * step;
      }
    }

    this.moving = vx !== 0 || vy !== 0;
    if (this.moving) {
      this.walkTime += dt;
      if (Math.abs(vx) > Math.abs(vy)) this.facing = vx > 0 ? 'right' : 'left';
      else this.facing = vy > 0 ? 'down' : 'up';
    } else {
      this.walkTime = 0;
    }
  }

  /** Move one axis at a time, so walking diagonally into a wall slides along it. */
  private moveWithCollision(dx: number, dy: number, map: TileMap): void {
    if (dx && this.fits(this.x + dx, this.y, map)) this.x += dx;
    if (dy && this.fits(this.x, this.y + dy, map)) this.y += dy;
  }

  private fits(x: number, y: number, map: TileMap): boolean {
    const left = Math.floor(x - HALF_W);
    const right = Math.floor(x + HALF_W);
    const top = Math.floor(y - HALF_H);
    const bottom = Math.floor(y + HALF_H);
    return (
      isWalkable(map, left, top) &&
      isWalkable(map, right, top) &&
      isWalkable(map, left, bottom) &&
      isWalkable(map, right, bottom)
    );
  }
}
