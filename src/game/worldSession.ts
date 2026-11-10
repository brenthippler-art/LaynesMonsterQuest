import { type WildMonster, WildMonsters } from '../encounters/wildMonsters';
import { findPath, nearestWalkable } from '../input/pathfind';
import { Player, type Point } from '../player/player';
import { type Camera } from '../render/camera';
import { type Scene } from '../render/renderer';
import { type Whereabouts } from '../save/autosave';
import { type PlayerSpot } from '../save/save';
import { doorAt, isWalkable } from '../world/tilemap';
import { World } from '../world/world';
import { type RealmDef, type WorldDef } from '../worlds/types';

/**
 * Everything about playing in ONE world: its maps, Layne's position, the
 * monsters wandering nearby, doors and the current realm.
 *
 * Nothing in here keeps timers or event listeners, so leaving a world is
 * simply: stop using this object. The browser then frees its maps and
 * monsters. (The picture caches that live outside it, the renderer's map
 * chunks and the corner map, are emptied by main.ts at the same time.)
 */
export class WorldSession {
  readonly world: World;
  readonly player: Player;
  readonly wild: WildMonsters;
  /** The realm Layne is standing in. On a square with no realm it keeps the last one, so the sign doesn't flicker. */
  realm: RealmDef;
  /** Where a tap-to-walk is heading (drawn as blinking brackets). */
  target: Point | null = null;
  /** 0..1: darkness of the quick fade when going through a door. */
  fade = 0;
  /** The monster on the encounter screen right now. */
  meeting: WildMonster | null = null;
  /** Seconds after an encounter before another can start (so you don't bump straight into the next one). */
  private encounterCooldown = 0;
  private lastTile: Point;

  /** `spot` = where Layne was last time in this world (undefined = first visit: start at the world's spawn). */
  constructor(
    def: WorldDef,
    spot: PlayerSpot | undefined,
    private camera: Camera,
  ) {
    this.world = new World(def);
    this.player = new Player(this.world.spawn.x + 0.5, this.world.spawn.y + 0.5);
    if (this.world.spawn.facing) this.player.facing = this.world.spawn.facing;
    // Put Layne back where he left off: same map, same spot, facing the same way.
    // (If that spot isn't valid anymore, he just starts at the beginning.)
    const savedMap = spot ? this.world.maps.get(spot.map) : undefined;
    if (spot && savedMap && isWalkable(savedMap, Math.floor(spot.x), Math.floor(spot.y))) {
      this.world.current = savedMap;
      this.player.placeAt(spot.x, spot.y);
      this.player.facing = spot.facing;
    }
    this.wild = new WildMonsters(this.world);
    this.realm = this.realmUnderLayne() ?? def.realms[0];
    this.lastTile = { x: Math.floor(this.player.x), y: Math.floor(this.player.y) };
    this.snapCamera();
  }

  get def(): WorldDef {
    return this.world.def;
  }

  /** For the auto-save. */
  whereabouts(): Whereabouts {
    const p = this.player;
    return { world: this.def.id, spot: { map: this.world.current.id, x: p.x, y: p.y, facing: p.facing } };
  }

  /** Jump the camera to Layne (at the start, after a door, after the screen changes size). */
  snapCamera(): void {
    const t = this.cameraTarget();
    this.camera.snap(t.x, t.y, this.world.current);
  }

  /** A tap on the world (CSS pixels): walk there, or walk up to the monster that was tapped. */
  tap(cssX: number, cssY: number): void {
    const { camera, player, world, wild } = this;
    const spot = camera.screenToWorld(cssX * camera.dpr, cssY * camera.dpr);
    const tappedMonster = wild.monsterAt(spot.x, spot.y);
    if (tappedMonster) wild.holdStill(tappedMonster); // it notices Layne and waits
    const tapped = tappedMonster ? { x: Math.floor(tappedMonster.x), y: Math.floor(tappedMonster.y) } : this.tileUnder(cssX, cssY);
    const goal = nearestWalkable(world.current, tapped);
    if (!goal) return;
    const path = findPath(world.current, { x: Math.floor(player.x), y: Math.floor(player.y) }, goal);
    if (!path) return;
    player.setPath(path);
    this.target = goal;
  }

  /**
   * One frame of play. `input` = keyboard or finger direction, `steer` = where a
   * steering finger is (or null). Returns a monster Layne just bumped into, if any,
   * and `movedMap` = true when he went through a door (time to save).
   */
  update(dt: number, input: Point, steer: Point | null): { bumped: WildMonster | null; movedMap: boolean } {
    const { player, world } = this;
    this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);
    player.update(dt, input, world.current);

    // While a finger steers, the brackets show where it is. Otherwise they show the tap-to-walk goal.
    if (steer) this.target = this.tileUnder(steer.x, steer.y);
    else if (!player.hasPath) this.target = null;

    const movedMap = this.checkDoors();
    const t = this.cameraTarget();
    this.camera.follow(t.x, t.y, world.current, dt);
    this.realm = this.realmUnderLayne() ?? this.realm;

    const bumped = this.wild.update(dt, world.current, player.x, player.y);
    if (!bumped || this.encounterCooldown > 0) return { bumped: null, movedMap };
    this.meeting = bumped;
    player.setPath([]);
    this.target = null;
    return { bumped, movedMap };
  }

  /** The encounter screen closed: the monster leaves (found, hopped off, or said bye). More will come! */
  endEncounter(): void {
    if (this.meeting) this.wild.remove(this.meeting);
    this.meeting = null;
    this.encounterCooldown = 1;
  }

  /** Called every frame, even while a screen is open on top (the door fade keeps fading). */
  tick(dt: number): void {
    this.fade = Math.max(0, this.fade - dt * 2.5);
  }

  /** What the renderer needs to draw this world. */
  scene(): Omit<Scene, 'camera' | 'glasses' | 'time'> {
    return { map: this.world.current, player: this.player, wild: this.wild.list, target: this.target, fade: this.fade };
  }

  /** Middle of Layne's body on screen, in CSS pixels (where finger-steering measures from). */
  layneOnScreen(): Point {
    const s = this.camera.toScreen(this.player.x, this.player.y - 0.6);
    return { x: s.x / this.camera.dpr, y: s.y / this.camera.dpr };
  }

  private realmUnderLayne(): RealmDef | null {
    return this.world.realmAt(this.world.current, Math.floor(this.player.x), Math.floor(this.player.y));
  }

  /** Aim the camera a little above Layne's feet, so his whole body is centered. */
  private cameraTarget(): Point {
    return { x: this.player.x, y: this.player.y - 0.5 };
  }

  /** Which tile is under a point on the screen (CSS pixels)? */
  private tileUnder(cssX: number, cssY: number): Point {
    const w = this.camera.screenToWorld(cssX * this.camera.dpr, cssY * this.camera.dpr);
    return { x: Math.floor(w.x), y: Math.floor(w.y) };
  }

  /** Cave entrances and exits. Only stepping ONTO a door square counts, so arriving next to one doesn't bounce you back. */
  private checkDoors(): boolean {
    const { player, world } = this;
    const tx = Math.floor(player.x);
    const ty = Math.floor(player.y);
    if (tx === this.lastTile.x && ty === this.lastTile.y) return false;
    this.lastTile = { x: tx, y: ty };
    const door = doorAt(world.current, tx, ty);
    if (!door) return false;
    world.goThrough(door);
    player.placeAt(door.toX + 0.5, door.toY + 0.5);
    this.lastTile = { x: door.toX, y: door.toY };
    this.target = null;
    this.snapCamera();
    this.fade = 1;
    return true;
  }
}
