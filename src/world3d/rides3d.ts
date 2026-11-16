import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, NearestFilter, type Object3D, PlaneGeometry, SRGBColorSpace } from 'three';
import { TILE_PIXELS } from '../config';
import { type MapRide, type TileMap } from '../world/tilemap';
import { tileTop } from './ground';

/**
 * Theme-park rides (and other moving things) in 3D. Each ride already knows how
 * to draw itself as pixel art (worlds/building/rides.ts); here it draws onto its
 * own small picture every frame, and that picture is shown on a flat sheet:
 *
 *   lying flat  rides drawn from above (the coaster track, bumper cars, lazy river)
 *   standing    rides drawn from the side (Ferris wheel, carousel, fireworks), turned
 *               to face the camera, like the cardboard scenery in an N64 game
 *
 * Which one is set by the ride's `stand3d` in its plan.
 */
const NEAR = 40; // only rides this close (in tiles) are redrawn each frame

interface Item {
  ride: MapRide;
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture;
  mesh: Mesh;
}

export class Rides3D {
  private items: Item[] = [];

  constructor(private parent: Object3D) {}

  /** Arriving on a map: make a sheet for each of its rides. */
  enter(map: TileMap): void {
    this.clear();
    for (const ride of map.rides ?? []) {
      const canvas = document.createElement('canvas');
      canvas.width = ride.w * TILE_PIXELS;
      canvas.height = ride.h * TILE_PIXELS;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      const texture = new CanvasTexture(canvas);
      texture.magFilter = texture.minFilter = NearestFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = SRGBColorSpace;
      // alphaTest: see-through pixels are left out completely (crisp edges, no sorting problems).
      const material = new MeshBasicMaterial({ map: texture, alphaTest: 0.5, side: DoubleSide });
      const geometry = new PlaneGeometry(ride.w, ride.h);
      const cx = ride.x + ride.w / 2;
      const cy = ride.y + ride.h / 2;
      const mesh = new Mesh(geometry, material);
      if (ride.stand3d === undefined) {
        geometry.rotateX(-Math.PI / 2); // lie down, the picture's top toward the north
        mesh.position.set(cx, tileTop(map, Math.floor(cx), Math.floor(cy)) + 0.03, cy);
      } else {
        geometry.translate(0, ride.h / 2, 0); // stand on its bottom edge
        mesh.position.set(cx, ride.stand3d, cy);
      }
      this.parent.add(mesh);
      this.items.push({ ride, ctx, texture, mesh });
    }
  }

  /** Move every nearby ride on, and turn the standing ones to face the camera. */
  update(time: number, yaw: number, lx: number, ly: number): void {
    for (const { ride, ctx, texture, mesh } of this.items) {
      const far = Math.hypot(mesh.position.x - lx, mesh.position.z - ly) > NEAR + Math.max(ride.w, ride.h);
      mesh.visible = !far;
      if (far) continue;
      if (ride.stand3d !== undefined) mesh.rotation.y = yaw;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ride.draw(ctx, 0, 0, 1, time);
      texture.needsUpdate = true;
    }
  }

  clear(): void {
    for (const { texture, mesh } of this.items) {
      this.parent.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as MeshBasicMaterial).dispose();
      texture.dispose();
    }
    this.items = [];
  }
}
