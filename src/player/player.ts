import { PLAYER_SPEED } from '../config';
import { canHop, isWalkable, type TileMap } from '../world/tilemap';

export type Facing = 'down' | 'up' | 'left' | 'right';
export interface Point {
  x: number;
  y: number;
}

/** Half the size of Layne's "feet box" in tiles. Only his feet bump into things. */
const HALF_W = 0.3;
const HALF_H = 0.2;

/** Jumping, in tiles: how fast he leaves the ground, and how fast gravity pulls him back. */
const JUMP_SPEED = 7.5;
const GRAVITY = 22;
/** Higher than this (in tiles), his feet clear a "hop" square: a creek or a puddle of sea he can jump over. */
const CLEAR = 0.15;
/** A jump that lands in the water still counts if there's dry ground this close (tiles). */
const LAND_REACH = 1.25;

export class Player {
  /** World position of Layne's feet, in tiles (x = 10.5 means the middle of column 10). */
  x: number;
  y: number;
  facing: Facing = 'down';
  moving = false;
  private walkTime = 0;
  /** Tiles left to walk through for tap-to-walk. */
  private path: Point[] = [];
  /** How high his feet are off the ground (tiles). 0 = standing. */
  air = 0;
  private airSpeed = 0;
  /** The last spot where he stood on solid ground. A jump that lands in water puts him back here. */
  private safe: Point;
  /** Set for one frame when a jump landed short and he went back to the bank (for a "plop" sound). */
  splashed = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.safe = { x, y };
  }

  /** Where to save him: never in mid-air over water. */
  get safeSpot(): Point {
    return this.air > 0 ? { ...this.safe } : { x: this.x, y: this.y };
  }

  /** Boing! (Only with his feet on the ground.) Returns true if he jumped. */
  jump(): boolean {
    if (this.air > 0) return false;
    this.airSpeed = JUMP_SPEED;
    this.air = 0.001;
    return true;
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
    this.safe = { x, y };
    this.path = [];
    this.air = 0;
  }

  /**
   * input = direction from the keyboard or a steering finger, each part -1..1.
   * If there's input, it wins and cancels any tap-to-walk path.
   */
  update(dt: number, input: Point, map: TileMap): void {
    this.splashed = false;
    // Jumping: up, then gravity brings him back down.
    if (this.air > 0) {
      this.airSpeed -= GRAVITY * dt;
      this.air = Math.max(0, this.air + this.airSpeed * dt);
      // Landed with a foot in the water? Be kind: hop onto the nearest dry square if there's one
      // close by (a stepping stone he just passed, the far bank). Otherwise, back to where he
      // jumped from, with a "plop". No harm done either way.
      if (this.air === 0 && !this.fits(this.x, this.y, map)) {
        const dry = this.nearestDry(map);
        this.x = dry ? dry.x : this.safe.x;
        this.y = dry ? dry.y : this.safe.y;
        this.path = [];
        this.splashed = !dry;
      }
    }
    if (this.air === 0 && this.fits(this.x, this.y, map)) this.safe = { x: this.x, y: this.y };

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

  /** The middle of the nearest square (within about a square) where he can stand, or null. */
  private nearestDry(map: TileMap): Point | null {
    let best: Point | null = null;
    let bestDist = LAND_REACH;
    const tx = Math.floor(this.x);
    const ty = Math.floor(this.y);
    for (let y = ty - 1; y <= ty + 1; y++) {
      for (let x = tx - 1; x <= tx + 1; x++) {
        const d = Math.hypot(x + 0.5 - this.x, y + 0.5 - this.y);
        if (d < bestDist && this.fits(x + 0.5, y + 0.5, map)) {
          best = { x: x + 0.5, y: y + 0.5 };
          bestDist = d;
        }
      }
    }
    return best;
  }

  /** Does his feet box fit here? High in a jump, "hop" squares (a creek, shallow sea) count as clear too. */
  private fits(x: number, y: number, map: TileMap): boolean {
    const left = Math.floor(x - HALF_W);
    const right = Math.floor(x + HALF_W);
    const top = Math.floor(y - HALF_H);
    const bottom = Math.floor(y + HALF_H);
    const high = this.air > CLEAR;
    const ok = (tx: number, ty: number) => isWalkable(map, tx, ty) || (high && canHop(map, tx, ty));
    return ok(left, top) && ok(right, top) && ok(left, bottom) && ok(right, bottom);
  }
}
