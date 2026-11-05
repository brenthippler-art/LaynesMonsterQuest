import { type WildMonster } from '../encounters/wildMonsters';
import { spriteFeet } from '../monsters/pixel/rasterize';
import { type Camera } from './camera';

const FEET = spriteFeet('small');

/**
 * Draw one wandering monster at the world's pixel size.
 * - It flickers in when it first appears (like old console sprites).
 * - It hops while walking and bobs gently while standing.
 * - It faces the way it's going.
 */
export function drawWildMonster(ctx: CanvasRenderingContext2D, camera: Camera, w: WildMonster, time: number): void {
  const sprite = w.sprite;
  if (!sprite) return; // still being built
  if (w.age < 0.5 && Math.floor(w.age * 16) % 2) return; // flicker in

  const p = camera.pixelPx;
  const hop = w.moving ? Math.round(Math.abs(Math.sin(w.age * 12)) * 2) : Math.floor(time * 2 + w.home.x) % 2;
  const feet = camera.toScreen(w.x, w.y);
  const left = feet.x - FEET.x * p;
  const top = feet.y - FEET.y * p - hop * p;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (w.facing < 0) {
    // Mirror around the monster's middle so it faces left.
    ctx.translate(feet.x * 2, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sprite, left, top, sprite.width * p, sprite.height * p);
  ctx.restore();
}
