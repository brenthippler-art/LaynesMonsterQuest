import {
  BufferAttribute,
  BufferGeometry,
  Color,
  GreaterDepth,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
  PointLight,
  Raycaster,
  RepeatWrapping,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { type WildMonster } from '../encounters/wildMonsters';
import { type WorldSession } from '../game/worldSession';
import { type WorldView } from '../game/worldView';
import { type GlassesStyle } from '../player/glasses';
import { type Point } from '../player/player';
import { NES } from '../render/nesPalette';
import { PixelBuffer } from '../render/pixels';
import { type TileMap } from '../world/tilemap';
import { CameraRig } from './cameraRig';
import { Chunks } from './chunks';
import { EDGE, forestEdge, groundY, tileColor, WATER_LEVEL } from './ground';
import { LayneModel } from './layneModel';
import { rgb, shade } from './meshBuilder';
import { MonsterActors, wrapAngle } from './monsterActors';
import { forgetMonsterModels } from './monsters/monsterModel';
import { Rides3D } from './rides3d';
import { forgetStandees } from './standees';
import { crispTexture } from './textured';
import { SHAPES } from './shapes';
import { HORIZON, Sky } from './sky';

/**
 * The 3D view of a world (see game/worldView.ts for what every view must do).
 *
 * One View3D is made the first time Layne enters a 3D world, and kept for the
 * whole visit (making a new WebGL drawing surface each time would be slow).
 * leave() throws away everything that belonged to the world he just left.
 *
 * The Nintendo 64 look comes from:
 *   - low-poly shapes with plain colors and flat faces (meshBuilder.ts)
 *   - drawing at a LOW resolution (about 360 pixels tall) and stretching it up with crisp pixels
 *   - fog that fades far-away things into the sky
 *   - round "blob" shadows under everyone
 *
 * Layne is never lost behind a tree or a hill: he's drawn in three steps.
 *   1. the world without him (layer 0)
 *   2. any part of him that's BEHIND something, as a see-through blue shadow ("ghost")
 *   3. the parts of him that can be seen, normally
 */
const PIXEL_ROWS = 360; // about how many pixels tall the 3D picture is drawn
const GRAVITY = 22;
const JUMP_SPEED = 7.5;
const TURN_SPEED = 12;

const CAVE_DARK = new Color('#140c04');
/** Building maps closed in by walls (an attic, a basement, a freezer): the dark around the dollhouse. */
const INDOOR_DARK = new Color('#20180c');
/** Layne lives on his own layer, so he can be drawn separately (see above). */
const LAYNE_LAYER = 1;

export class View3D implements WorldView {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private rig = new CameraRig();
  private chunks: Chunks;
  private layne: LayneModel;
  private layneShadow: Mesh;
  private actors: MonsterActors;
  private sky = new Sky();
  private water: Mesh;
  private seabed: Mesh;
  private marker: Mesh;
  private lantern = new PointLight('#ffd890', 0, 9, 1.2);
  private hemi = new HemisphereLight('#ffffff', '#606060', 2.2);
  private sun = new DirectionalLight('#ffffff', 2.2);
  private fade: HTMLDivElement;
  private raycaster = new Raycaster();
  private rides: Rides3D;
  /** The ground past the map's edges: building worlds' outside tile picture repeated (grass, a parking lot...), or a forest's dark floor. */
  private outside = new Mesh(new BufferGeometry(), new MeshLambertMaterial());
  private ghost = new MeshBasicMaterial({
    color: NES.blue,
    transparent: true,
    opacity: 0.55,
    depthFunc: GreaterDepth, // only where something is in front of him
    depthWrite: false,
    fog: false,
  });

  private map: TileMap | null = null;
  private buildAll = true;
  private heading = Math.PI; // Layne faces the camera when he arrives
  private walk = 0;
  private air = 0;
  private airSpeed = 0;
  private last: Point = { x: 0, y: 0 };

  constructor(parent: HTMLElement, before: Element | null, glasses: GlassesStyle) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game3d';
    this.canvas.hidden = true;
    parent.insertBefore(this.canvas, before);
    this.fade = document.createElement('div');
    this.fade.className = 'game3d-fade';
    parent.insertBefore(this.fade, before);

    // antialias off: crisp chunky edges, and faster on tablets.
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);

    const lit = new MeshLambertMaterial({ vertexColors: true });
    const glow = new MeshBasicMaterial({ vertexColors: true });
    const shadow = new MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.3, depthWrite: false });
    this.chunks = new Chunks(this.scene, { lit, glow });
    this.actors = new MonsterActors(this.scene, lit, shadow);

    this.layne = new LayneModel(glasses, lit);
    this.layneShadow = new Mesh(new PlaneGeometry(0.55, 0.55).rotateX(-Math.PI / 2), shadow);
    this.layneShadow.renderOrder = 1;
    this.scene.add(this.layne.root, this.layneShadow, this.sky.group, this.hemi, this.sun, this.sun.target, this.lantern);
    this.layne.root.traverse((o) => o.layers.set(LAYNE_LAYER));
    // Lights only light the layers they're on: these light the world AND Layne.
    for (const light of [this.hemi, this.sun, this.lantern]) light.layers.enable(LAYNE_LAYER);

    // The sea: a see-through blue sheet at water level, and a darker sea floor under it.
    this.water = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new MeshLambertMaterial({ color: NES.sky, transparent: true, opacity: 0.8 }));
    this.seabed = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new MeshLambertMaterial({ color: NES.blue }));
    this.scene.add(this.water, this.seabed, this.outside);
    this.rides = new Rides3D(this.scene);

    // Tap-to-walk: a spinning yellow diamond over the spot.
    this.marker = new Mesh(SHAPES.diamond(), new MeshBasicMaterial({ color: NES.gold }));
    this.marker.scale.set(0.15, 0.25, 0.15);
    this.scene.add(this.marker);

    new ResizeObserver(() => this.resize()).observe(this.canvas);
  }

  /** Show or hide the 3D picture (2D worlds use the other canvas). */
  setVisible(on: boolean): void {
    this.canvas.hidden = !on;
    this.fade.hidden = !on;
    if (on) this.resize();
  }

  /** Throw away everything from the world Layne just left (its chunks and monster models). */
  leave(): void {
    this.chunks.clear();
    this.actors.clear();
    this.rides.clear();
    this.setOutside(null);
    forgetMonsterModels();
    forgetStandees();
    this.map = null;
    // The next world starts fresh: camera looking north, Layne facing the camera, feet on the ground.
    this.rig.resetTurn();
    this.heading = Math.PI;
    this.air = 0;
  }

  // ----- WorldView -----

  snap(x: number, y: number, map: TileMap): void {
    if (map !== this.map) this.enterMap(map);
    this.rig.aim(x, groundY(map, x, y), y);
    this.rig.snap(this.groundFn);
    this.last = { x, y };
    this.buildAll = true;
  }

  follow(x: number, y: number, map: TileMap): void {
    this.rig.aim(x, groundY(map, x, y) + this.air * 0.5, y);
  }

  pick(cssX: number, cssY: number, wild: WildMonster[]): { monster: WildMonster | null; ground: Point | null } {
    const ndc = new Vector2((cssX / this.canvas.clientWidth) * 2 - 1, -(cssY / this.canvas.clientHeight) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.rig.camera);
    let monster: WildMonster | null = null;
    if (wild.length) {
      const hit = this.raycaster.intersectObjects(this.actors.meshes, false)[0];
      const w = hit ? this.actors.owner(hit.object) : null;
      if (w && wild.includes(w) && w.sprite) monster = w;
    }
    return { monster, ground: this.groundUnderRay(this.raycaster.ray.origin, this.raycaster.ray.direction) };
  }

  toScreen(x: number, y: number): Point {
    const map = this.map;
    const p = new Vector3(x, (map ? groundY(map, x, y) : 0) + 0.5, y).project(this.rig.camera);
    return { x: ((p.x + 1) / 2) * this.canvas.clientWidth, y: ((1 - p.y) / 2) * this.canvas.clientHeight };
  }

  toWorldDir(input: Point): Point {
    return this.rig.toWorldDir(input);
  }

  // ----- Things only the 3D view does -----

  /** Turn the camera left (-1) or right (1). */
  turn(steps: number): void {
    this.rig.turn(steps);
  }

  /** Boing! (Only when his feet are on the ground.) Returns true if he jumped. */
  jump(): boolean {
    if (this.air > 0) return false;
    this.airSpeed = JUMP_SPEED;
    this.air = 0.001;
    return true;
  }

  /** Draw one frame. */
  draw(session: WorldSession, dt: number, time: number): void {
    const map = session.world.current;
    if (map !== this.map) this.enterMap(map);
    const p = session.player;

    // Jumping: up, then gravity brings him back down.
    if (this.air > 0) {
      this.airSpeed -= GRAVITY * dt;
      this.air = Math.max(0, this.air + this.airSpeed * dt);
    }

    // Turn to face the way he's walking, smoothly.
    const dx = p.x - this.last.x;
    const dy = p.y - this.last.y;
    this.last = { x: p.x, y: p.y };
    const moving = Math.hypot(dx, dy) > 0.0005 && Math.hypot(dx, dy) < 1; // (a door jump isn't walking)
    if (moving) this.heading += wrapAngle(Math.atan2(dx, dy) - this.heading) * (1 - Math.exp(-dt * TURN_SPEED));
    this.walk = moving ? this.walk + dt : 0;

    const gy = groundY(map, p.x, p.y);
    this.layne.root.position.set(p.x, gy + this.air, p.y);
    this.layne.root.rotation.y = this.heading;
    this.layne.pose(this.walk, this.air);
    this.layneShadow.position.set(p.x, gy + 0.03, p.y);
    this.layneShadow.scale.setScalar(1 / (1 + this.air));
    this.lantern.position.set(p.x, gy + 1.6, p.y);

    this.chunks.update(map, p.x, p.y, this.rig.facing, this.buildAll);
    this.buildAll = false;
    this.actors.update(session.wild.list, map, p.x, p.y, dt);

    const t = session.target;
    this.marker.visible = !!t;
    if (t) {
      this.marker.position.set(t.x + 0.5, groundY(map, t.x + 0.5, t.y + 0.5) + 0.45 + Math.sin(time * 5) * 0.08, t.y + 0.5);
      this.marker.rotation.y = time * 3;
    }

    this.rides.update(time, this.rig.yaw, p.x, p.y);
    this.water.position.y = WATER_LEVEL + Math.sin(time * 1.2) * 0.03; // the sea gently rises and falls
    this.rig.update(dt, this.groundFn);
    const cam = this.rig.camera.position;
    this.sky.update(cam.x, cam.y, cam.z, time);
    this.fade.style.opacity = String(session.fade);
    this.render();
  }

  /** The three drawing steps from the top of this file. */
  private render(): void {
    const { renderer, scene } = this;
    const camera = this.rig.camera;
    const background = scene.background;
    camera.layers.set(0);
    renderer.render(scene, camera); // 1. the world
    renderer.autoClear = false; // draw on top of it
    scene.background = null;
    camera.layers.set(LAYNE_LAYER);
    scene.overrideMaterial = this.ghost;
    renderer.render(scene, camera); // 2. his hidden parts, as a ghost
    scene.overrideMaterial = null;
    renderer.render(scene, camera); // 3. him
    camera.layers.set(0);
    scene.background = background;
    renderer.autoClear = true;
  }

  // ----- Inside -----

  private groundFn = (x: number, z: number): number => (this.map ? Math.max(groundY(this.map, x, z), WATER_LEVEL) : 0);

  /**
   * Arriving on a map. Three kinds:
   *   the island outside   sky, sea and sunshine
   *   The Woods outside    the same sky, with a ring of trees and dark forest floor past its edges
   *   a cave               dark, with a lantern around Layne
   *   a building map       sunshine and sky like a dollhouse with no roof, and the outside tile
   *                        (grass, a parking lot) stretching away. Maps closed in by walls
   *                        (an attic, a basement) have darkness around them instead of sky.
   */
  private enterMap(map: TileMap): void {
    this.chunks.clear();
    this.actors.clear();
    this.map = map;
    this.buildAll = true;
    this.rides.enter(map);
    const enclosed = !!map.look && map.look.height3d(map.outside) >= 1;
    const outdoors = map.kind === 'overworld' || (!!map.look && !enclosed);
    const bg = outdoors ? HORIZON : map.look ? INDOOR_DARK : CAVE_DARK;
    this.scene.background = bg;
    this.scene.fog = outdoors ? new Fog(bg, 22, 52) : map.look ? new Fog(bg, 14, 34) : new Fog(bg, 6, 20);
    this.sky.group.visible = outdoors;
    this.water.visible = this.seabed.visible = outdoors && !map.look;
    this.setOutside(outdoors && (map.look || forestEdge(map)) ? map : null);
    // The sea reaches far past the island's edge.
    for (const [mesh, y] of [[this.water, WATER_LEVEL], [this.seabed, -1.6]] as const) {
      mesh.scale.set(map.width + 300, 1, map.height + 300);
      mesh.position.set(map.width / 2, y, map.height / 2);
    }
    const cave = !outdoors && !map.look;
    this.hemi.intensity = cave ? 0.9 : 2.2;
    this.sun.intensity = cave ? 0.3 : 2.2;
    this.lantern.intensity = cave ? 6 : 0;
    this.sun.position.set(map.width / 2 - 40, 80, map.height / 2 + 30);
    this.sun.target.position.set(map.width / 2, 0, map.height / 2);
  }

  /** The ground past a building map's or a forest's edges (null = none). */
  private setOutside(map: TileMap | null): void {
    const material = this.outside.material as MeshLambertMaterial;
    material.map?.dispose();
    material.map = null;
    this.outside.geometry.dispose();
    this.outside.visible = !!map;
    if (!map) return;
    if (!map.look) {
      // A forest: plain dark forest floor, starting behind the ring of trees, under the fog.
      material.color.set(shade(rgb(tileColor(map, map.outside)), -0.25));
      material.needsUpdate = true;
      this.outside.geometry = outsideFrame(map.width, map.height, 120, EDGE - 1);
      return;
    }
    material.color.set('#ffffff');
    const buf = new PixelBuffer(16, 16);
    map.look.drawTile(buf, map, -1, -1, 0, 0); // a square off the map = the outside tile
    const texture = crispTexture(buf);
    texture.wrapS = texture.wrapT = RepeatWrapping; // the picture repeats once per tile
    material.map = texture;
    material.needsUpdate = true;
    this.outside.geometry = outsideFrame(map.width, map.height, 120);
  }

  /** Walk along a ray until it goes under the ground: that's the spot that was tapped. */
  private groundUnderRay(from: Vector3, dir: Vector3): Point | null {
    const map = this.map;
    if (!map) return null;
    const p = from.clone();
    for (let step = 0; step < 900; step++) {
      p.addScaledVector(dir, 0.1);
      if (p.y < this.groundFn(p.x, p.z)) return { x: p.x, y: p.z };
    }
    return null; // the sky
  }

  private resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.max(1, Math.round((h * dpr) / PIXEL_ROWS));
    this.renderer.setSize(Math.round((w * dpr) / scale), Math.round((h * dpr) / scale), false);
    this.rig.resize(w, h);
  }
}

/**
 * A big flat frame around the map (a hole in the middle where the map is), 120
 * tiles wide. Its picture spots are just its tile positions, so the repeated
 * picture lines up with the map's squares.
 */
function outsideFrame(w: number, h: number, m: number, gap = 0): BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const rect = (x0: number, z0: number, x1: number, z1: number) => {
    // Two triangles, counter-clockwise seen from above.
    for (const [x, z] of [[x0, z0], [x0, z1], [x1, z1], [x0, z0], [x1, z1], [x1, z0]]) {
      pos.push(x, 0, z);
      uv.push(x, -z);
    }
  };
  // `gap` leaves that many squares free all around the map (for a forest's ring of trees).
  const g = gap;
  rect(-m, -m, w + m, -g); // north
  rect(-m, h + g, w + m, h + m); // south
  rect(-m, -g, -g, h + g); // west
  rect(w + g, -g, w + m, h + g); // east
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
  geo.computeVertexNormals();
  return geo;
}
