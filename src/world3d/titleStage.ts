import { DirectionalLight, HemisphereLight, type Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { type Monster } from '../monsters/monsterTypes';
import { type GlassesStyle } from '../player/glasses';
import { NES } from '../render/nesPalette';
import { Decor } from '../world/decorations';
import { LayneModel } from './layneModel';
import { drawInto } from './menuRenderer';
import { MeshBuilder, place, rgb } from './meshBuilder';
import { monsterGeometry, SIZE_3D } from './monsters/monsterModel';
import { addIslandDecor } from './props/islandDecor';
import { SHAPES } from './shapes';

/**
 * The title screen's little 3D show: a round grassy island floating in the sky,
 * like a level in an old Nintendo 64 game. Layne walks in place in the middle and
 * his monster friends hop around him. The camera sways slowly from side to side.
 *
 * Drawn small (WIDTH x HEIGHT pixels) and stretched up with sharp pixels, for the
 * chunky look. The picture goes on `canvas`, which the title screen puts on the page.
 */
const WIDTH = 320;
const HEIGHT = 200;
const ISLAND = 3.2; // the island's radius, in tiles
/** Where the friends stand: two beside Layne, two further back. */
const SPOTS = [
  { x: -1.35, z: 0.35 },
  { x: 1.35, z: 0.35 },
  { x: -2.25, z: -0.75 },
  { x: 2.25, z: -0.75 },
];
const SILHOUETTE = '#1c1c1c';

interface Friend {
  mesh: Mesh;
  shadow: Mesh;
  x: number;
  z: number;
  size: number;
  phase: number;
}

export class TitleStage {
  readonly canvas = document.createElement('canvas');
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, WIDTH / HEIGHT, 0.1, 60);
  private lit = new MeshLambertMaterial({ vertexColors: true });
  private mystery = new MeshBasicMaterial({ color: SILHOUETTE });
  private shadowMat = new MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.3, depthWrite: false });
  private layne: LayneModel;
  private friends: Friend[] = [];
  private time = 0;

  constructor(
    private renderer: WebGLRenderer,
    glasses: GlassesStyle,
  ) {
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.className = 'title__stage3d';
    this.canvas.setAttribute('aria-hidden', 'true');

    const sun = new DirectionalLight('#ffffff', 2.2);
    sun.position.set(2, 5, 4);
    this.scene.add(new HemisphereLight('#ffffff', '#606060', 2.2), sun);
    this.scene.add(new Mesh(island(), this.lit));

    this.layne = new LayneModel(glasses, this.lit);
    this.layne.root.position.set(0, 0, 0.6);
    this.scene.add(this.layne.root, this.shadow(0, 0.6, 0.6));
  }

  /** Who hops around Layne. `mystery`: draw them as dark shapes (he hasn't caught anyone yet). */
  setFriends(monsters: readonly Monster[], mystery: boolean): void {
    for (const f of this.friends) this.scene.remove(f.mesh, f.shadow);
    this.friends = monsters.slice(0, SPOTS.length).map((m, i) => {
      const material: Material = mystery ? this.mystery : this.lit;
      const mesh = new Mesh(monsterGeometry(m), material);
      const size = SIZE_3D[m.size];
      mesh.scale.setScalar(size);
      const { x, z } = SPOTS[i];
      // Turn a little towards the middle, so they're all looking at the camera AND at Layne.
      mesh.rotation.y = -Math.sign(x) * 0.5;
      const shadow = this.shadow(x, z, 0.5 * size);
      this.scene.add(mesh, shadow);
      return { mesh, shadow, x, z, size, phase: i * 1.7 };
    });
    this.update(0);
  }

  /** Move everyone a little and draw. Called every frame while the title screen is open. */
  update(dt: number): void {
    this.time += dt;
    const t = this.time;
    this.layne.pose(t, 0); // walking in place
    for (const f of this.friends) {
      // Hop, hop, rest... each friend on its own beat.
      const beat = (t * 1.4 + f.phase) % 2;
      const up = beat < 1 ? Math.sin(beat * Math.PI) * 0.45 : 0;
      f.mesh.position.set(f.x, up, f.z);
      // Squash a little when landing, stretch in the air.
      const squash = beat < 1 ? 1 + up * 0.15 : 1 - Math.sin((beat - 1) * Math.PI) * 0.06;
      f.mesh.scale.set(f.size / Math.sqrt(squash), f.size * squash, f.size / Math.sqrt(squash));
      f.shadow.scale.setScalar(0.5 * f.size * (1 - up * 0.5));
    }
    // The camera sways slowly from side to side (never round the back, where the trees are).
    const a = Math.sin(t * 0.25) * 0.55;
    this.camera.position.set(Math.sin(a) * 9.5, 3.6, Math.cos(a) * 9.5);
    this.camera.lookAt(0, -0.25, 0);
    drawInto(this.renderer, this.scene, this.camera, this.canvas);
  }

  /** A soft dark spot on the grass, under someone's feet. */
  private shadow(x: number, z: number, r: number): Mesh {
    const m = new Mesh(SHAPES.disc(12), this.shadowMat);
    m.position.set(x, 0.02, z);
    m.scale.setScalar(r);
    return m;
  }
}

/** The floating island: a grassy top, earth underneath that narrows to a point, trees round the back. */
function island() {
  const b = new MeshBuilder();
  const grass = rgb(NES.greenBright);
  const grassSide = rgb(NES.green);
  const earth = rgb(NES.brownRed);
  const earthDark = rgb(NES.brownDark);
  // The grass top (a short fat cylinder): lime on top, darker on the sides.
  b.add(SHAPES.tube(14), place(0, -0.3, 0, ISLAND, 0.3, ISLAND), (p) => (p.y > 0.99 ? grass : grassSide));
  // The earth under it, an upside-down cone in stripes.
  b.add(SHAPES.cone(14, 4), place(0, -0.3, 0, ISLAND * 0.97, 2.6, ISLAND * 0.97, Math.PI), (p) => (Math.floor(p.y * 4) % 2 ? earth : earthDark));
  // Trees and bushes round the back, a few flowers and a rock at the front.
  const decor: [number, number, number][] = [
    [Decor.Tree, -2.2, -2.0],
    [Decor.Pine, -0.9, -2.6],
    [Decor.Tree, 0.6, -2.5],
    [Decor.Pine, 1.9, -2.1],
    [Decor.Bush, 2.7, -0.9],
    [Decor.Bush, -2.8, -0.6],
    [Decor.Flower, -0.7, 1.9],
    [Decor.Flower, 0.9, 2.2],
    [Decor.Flower, 2.1, 1.4],
    [Decor.Rock, -2.0, 1.6],
  ];
  const glow = new MeshBuilder(); // (only lava cracks glow: none here)
  decor.forEach(([d, x, z], i) => addIslandDecor(d, { x, y: 0, z, r1: (i * 0.37) % 1, r2: (i * 0.61) % 1 }, b, glow));
  return b.build()!;
}
