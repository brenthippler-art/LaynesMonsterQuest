import { DirectionalLight, HemisphereLight, Mesh, MeshLambertMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { type Monster } from '../monsters/monsterTypes';
import { monsterGeometry, SIZE_3D } from './monsters/monsterModel';

/**
 * The monster on the encounter screen, in 3D: it turns slowly on the spot so
 * Layne can see it from every side. It has its own small drawing surface (made
 * the first time it's needed), drawn at a low resolution for the chunky look.
 */
const PIXELS = 160;

export class Turntable {
  private renderer: WebGLRenderer | null = null;
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, 1, 0.1, 20);
  private mesh = new Mesh(undefined, new MeshLambertMaterial({ vertexColors: true }));
  private time = 0;
  private size = 1;

  constructor() {
    const sun = new DirectionalLight('#ffffff', 2.4);
    sun.position.set(1, 2, 3);
    this.scene.add(new HemisphereLight('#ffffff', '#808080', 2.2), sun, this.mesh);
  }

  /** Start showing this monster. Returns the canvas to put on the encounter screen. */
  show(m: Monster): HTMLCanvasElement {
    if (!this.renderer) {
      // alpha: the encounter box shows through around the monster.
      this.renderer = new WebGLRenderer({ antialias: false, alpha: true });
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(PIXELS, PIXELS, false);
      this.renderer.domElement.className = 'turntable';
    }
    this.mesh.geometry = monsterGeometry(m);
    this.size = SIZE_3D[m.size];
    this.time = 0;
    this.update(0);
    return this.renderer.domElement;
  }

  /** Turn a little and draw. Called every frame while the encounter screen is open. */
  update(dt: number): void {
    if (!this.renderer) return;
    this.time += dt;
    // Start facing Layne (the front), then slowly turn around and around.
    this.mesh.rotation.y = Math.sin(this.time * 0.8) * 0.9;
    this.mesh.position.y = Math.abs(Math.sin(this.time * 3)) * 0.05;
    // Bigger monsters: step the camera back so they always fit.
    const d = 2.6 * Math.max(1, this.size);
    this.camera.position.set(0, 0.55 + d * 0.2, d);
    this.camera.lookAt(0, 0.42 * this.size, 0);
    this.renderer.render(this.scene, this.camera);
  }
}
