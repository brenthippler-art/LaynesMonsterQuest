import { type BufferGeometry, DirectionalLight, HemisphereLight, type Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { type Monster } from '../monsters/monsterTypes';
import { drawInto } from './menuRenderer';
import { monsterGeometry, SIZE_3D } from './monsters/monsterModel';

/**
 * The world picker's 3D monsters: one standing on each world card, a monster
 * from that world. Monsters Layne has caught are in color; if he hasn't caught
 * any there yet, it's a dark mystery shape. The card in the middle of the screen
 * turns its monster round and makes it hop; the others stand still.
 *
 * Every card shares the one menu surface (see menuRenderer.ts): each monster is
 * drawn there, then copied onto its card's own canvas.
 */
export interface CardMonster {
  canvas: HTMLCanvasElement;
  monster: Monster;
  mystery: boolean;
}

const SILHOUETTE = '#1c1c1c';

export class CardMonsters {
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, 1, 0.1, 20);
  private lit = new MeshLambertMaterial({ vertexColors: true });
  private dark = new MeshBasicMaterial({ color: SILHOUETTE });
  private mesh = new Mesh<BufferGeometry, Material>(undefined, this.lit);
  private cards: CardMonster[] = [];
  private active: CardMonster | null = null;
  private time = 0;

  constructor(private renderer: WebGLRenderer) {
    const sun = new DirectionalLight('#ffffff', 2.4);
    sun.position.set(1, 2, 3);
    this.scene.add(new HemisphereLight('#ffffff', '#808080', 2.2), sun, this.mesh);
  }

  /** New cards: draw every monster once, standing still and facing out. */
  show(cards: CardMonster[]): void {
    this.cards = cards;
    this.active = null;
    for (const c of cards) this.draw(c, 0, 0);
  }

  /** Called every frame while the picker is open. `middle`: the canvas on the card in the middle of the screen. */
  update(dt: number, middle: HTMLCanvasElement | null): void {
    const card = this.cards.find((c) => c.canvas === middle) ?? null;
    if (card !== this.active) {
      if (this.active) this.draw(this.active, 0, 0); // the old one stops, facing out
      this.active = card;
      this.time = 0;
    }
    if (!card) return;
    this.time += dt;
    const turn = Math.sin(this.time * 0.9) * 1.1;
    const hop = Math.max(0, Math.sin(this.time * 4)) * 0.12;
    this.draw(card, turn, hop);
  }

  private draw(c: CardMonster, turn: number, hop: number): void {
    const size = SIZE_3D[c.monster.size];
    this.mesh.geometry = monsterGeometry(c.monster);
    this.mesh.material = c.mystery ? this.dark : this.lit;
    this.mesh.rotation.y = turn;
    this.mesh.position.y = hop;
    // Bigger monsters: step the camera back so they always fit (like the encounter screen).
    const d = 2.9 * Math.max(1, size);
    this.camera.position.set(0, 0.5 + d * 0.22, d);
    this.camera.lookAt(0, 0.45 * size, 0);
    drawInto(this.renderer, this.scene, this.camera, c.canvas);
  }
}
