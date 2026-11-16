import { PerspectiveCamera, Vector3 } from 'three';
import { type Point } from '../player/player';

/**
 * The camera: it floats up and behind Layne and looks down at him, like the
 * camera in a Nintendo 64 adventure. It doesn't spin around on its own (that
 * can make a six-year-old dizzy): it only turns when the turn buttons or the
 * Q / E keys are pressed, a quarter of a quarter-turn (45°) at a time.
 *
 * yaw = which way the camera looks. 0 = looking north (up the map), so a new
 * world starts out matching the corner map.
 */
const STEP = Math.PI / 4;
const PITCH = 0.62; // how steeply it looks down (radians, about 35°)
const DISTANCE = 7.2; // tiles from Layne
const PORTRAIT_DISTANCE = 9.5; // a tall, narrow screen sees less to the sides, so step back
const LOOK_HEIGHT = 0.6; // aim at Layne's middle, not his feet
const ABOVE_GROUND = 1.0; // never closer to the ground than this (no looking through hills)

export class CameraRig {
  readonly camera = new PerspectiveCamera(50, 1, 0.1, 90);
  /** Which way the camera looks right now (radians). */
  yaw = 0;
  private wantYaw = 0;
  private focus = new Vector3();
  private wantFocus = new Vector3();
  private distance = DISTANCE;

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.distance = width < height ? PORTRAIT_DISTANCE : DISTANCE;
    this.camera.updateProjectionMatrix();
  }

  /** Turn the camera: -1 = to the left, 1 = to the right. */
  turn(steps: number): void {
    this.wantYaw += steps * STEP;
  }

  /** Back to looking north (a new world). */
  resetTurn(): void {
    this.yaw = this.wantYaw = 0;
  }

  /** Where the camera should look (Layne's feet, in 3D: x, height, z). */
  aim(x: number, y: number, z: number): void {
    this.wantFocus.set(x, y + LOOK_HEIGHT, z);
  }

  /** Jump straight there (no gliding). */
  snap(ground: (x: number, z: number) => number): void {
    this.focus.copy(this.wantFocus);
    this.yaw = this.wantYaw;
    this.place(ground);
  }

  /** Glide toward where it should be. Called every frame. */
  update(dt: number, ground: (x: number, z: number) => number): void {
    const k = 1 - Math.exp(-dt * 8);
    this.focus.lerp(this.wantFocus, k);
    this.yaw += (this.wantYaw - this.yaw) * (1 - Math.exp(-dt * 7));
    this.place(ground);
  }

  /** Screen "up/down/left/right" (from the keys or a finger) → a direction on the map. */
  toWorldDir(input: Point): Point {
    const s = Math.sin(this.yaw);
    const c = Math.cos(this.yaw);
    // Screen right = the camera's right; screen up (y = -1) = the way the camera looks.
    return { x: input.x * c + input.y * s, y: -input.x * s + input.y * c };
  }

  private place(ground: (x: number, z: number) => number): void {
    const f = this.focus;
    const flat = Math.cos(PITCH) * this.distance;
    const cam = this.camera.position;
    cam.set(f.x + Math.sin(this.yaw) * flat, f.y + Math.sin(PITCH) * this.distance, f.z + Math.cos(this.yaw) * flat);
    // Hills in the way? Lift the camera above them (checking the camera's spot and halfway back to Layne).
    const lowest = Math.max(ground(cam.x, cam.z), ground((cam.x + f.x) / 2, (cam.z + f.z) / 2) - 0.5 * Math.sin(PITCH) * this.distance) + ABOVE_GROUND;
    if (cam.y < lowest) cam.y = lowest;
    this.camera.lookAt(f);
  }
}
