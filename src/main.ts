import './style.css';
import { music } from './audio/music';
import { sfx } from './audio/sfx';
import { WORLD_SEED } from './config';
import { EncounterScreen } from './encounters/encounterScreen';
import { type WildMonster, WildMonsters } from './encounters/wildMonsters';
import { startLoop } from './core/loop';
import { Keyboard } from './input/keyboard';
import { preventTabletZoom } from './input/noZoom';
import { findPath, nearestWalkable } from './input/pathfind';
import { PointerControls } from './input/pointerControls';
import { GLASSES_STYLES, pickNewGlasses } from './player/glasses';
import { Player, type Point } from './player/player';
import { Camera } from './render/camera';
import { setupCanvas } from './render/canvas';
import { Renderer } from './render/renderer';
import { MonsterBook } from './book/monsterBook';
import { ParentArea } from './parent/parentArea';
import { AutoSave } from './save/autosave';
import { loadSave, recordFound } from './save/save';
import { HowToPlay } from './tutorial/howToPlay';
import { BiomeBadge } from './ui/biomeBadge';
import { MuteButton } from './ui/muteButton';
import { WorldMap } from './ui/worldMap';
import { biomeAt, doorAt, isWalkable } from './world/tilemap';
import { World } from './world/world';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLElement;
// alpha: false = the canvas is never see-through, which lets the browser draw it faster.
const ctx = canvas.getContext('2d', { alpha: false })!;

// ----- Build everything -----
const world = new World(WORLD_SEED);
const player = new Player(world.spawn.x + 0.5, world.spawn.y + 0.5);
const camera = new Camera();
const renderer = new Renderer(ctx);
const keyboard = new Keyboard();
const badge = new BiomeBadge(ui);
const worldMap = new WorldMap(ui);

// ----- Load the save (a damaged save is backed up and a new game starts; it never crashes) -----
const { data: save, recovered } = loadSave();

// Put Layne back where he left off: same map, same spot, facing the same way.
// (If that spot isn't valid anymore, he just starts at the beginning.)
const spot = save.player;
const savedMap = spot ? world.maps.get(spot.map) : undefined;
if (spot && savedMap && isWalkable(savedMap, Math.floor(spot.x), Math.floor(spot.y))) {
  world.current = savedMap;
  player.placeAt(spot.x, spot.y);
  player.facing = spot.facing;
}

const autosave = new AutoSave(save, () => ({ map: world.current.id, x: player.x, y: player.y, facing: player.facing }));
// Dev only: /devices shows several copies of the game at once; "?nosave" stops them overwriting the real save.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('nosave')) autosave.stop();

// New glasses every visit: pick one that's different from last time, and remember it.
save.lastGlasses = pickNewGlasses(save.lastGlasses);
autosave.now();
const glasses = GLASSES_STYLES[save.lastGlasses];

// ----- Sound -----
// Browsers only allow sound after the first touch or key press. iPad Safari is picky about
// WHICH events count (it prefers touchend/click), so listen for all of them.
const unlockSound = () => sfx.unlock();
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
  window.addEventListener(type, unlockSound, { capture: true, passive: true });
}

// A button clicked with a mouse or finger keeps "keyboard focus", so pressing Space or
// Enter later would press it again (e.g. turning the sound off while walking). Let go of
// focus after mouse/finger clicks. (e.detail is 0 for keyboard presses, which keep focus.)
document.addEventListener('click', (e) => {
  if (e.detail > 0) (e.target as HTMLElement).closest('button')?.blur();
});
new MuteButton(ui, save.muted, (muted) => {
  save.muted = muted;
  autosave.now();
});

// ----- Monster Book (bottom-left) and the grown-ups area (hold the gear for 3 seconds) -----
const book = new MonsterBook(ui, save);

// ----- Picture "how to play": shown on the very first visit (and from the grown-ups area) -----
const howToPlay = new HowToPlay(ui, glasses, () => {
  save.tutorialSeen = true;
  autosave.now();
});
if (!save.tutorialSeen) howToPlay.open();

const parentArea = new ParentArea(ui, save, autosave, recovered, () => howToPlay.open());

// ----- Monsters: wandering nearby, and the encounter screen -----
const wild = new WildMonsters();
let meeting: WildMonster | null = null;
/** Seconds after an encounter before another can start (so you don't bump straight into the next one). */
let encounterCooldown = 0;
const encounter = new EncounterScreen(
  ui,
  (m) => {
    const record = recordFound(save, m.id);
    autosave.now(); // save right after every catch
    return record.count;
  },
  () => {
    // Found, hopped away, or said bye: either way it leaves the map. More will come!
    if (meeting) wild.remove(meeting);
    meeting = null;
    encounterCooldown = 1;
  },
);

/** Aim the camera a little above Layne's feet, so his whole body is centered. */
const cameraTarget = () => ({ x: player.x, y: player.y - 0.5 });

setupCanvas(canvas, (vp) => {
  camera.resize(vp);
  const t = cameraTarget();
  camera.snap(t.x, t.y, world.current);
});

/** Which tile is under a point on the screen (CSS pixels)? */
function tileUnder(cssX: number, cssY: number): Point {
  const w = camera.screenToWorld(cssX * camera.dpr, cssY * camera.dpr);
  return { x: Math.floor(w.x), y: Math.floor(w.y) };
}

/** Middle of Layne's body on screen, in CSS pixels (where finger-steering measures from). */
function layneOnScreen(): Point {
  const s = camera.toScreen(player.x, player.y - 0.6);
  return { x: s.x / camera.dpr, y: s.y / camera.dpr };
}

// ----- Finger / mouse: tap to walk there, hold or drag to steer -----
let target: Point | null = null;
const pointer = new PointerControls(canvas, (cssX, cssY) => {
  const goal = nearestWalkable(world.current, tileUnder(cssX, cssY));
  if (!goal) return;
  const path = findPath(world.current, { x: Math.floor(player.x), y: Math.floor(player.y) }, goal);
  if (!path) return;
  player.setPath(path);
  target = goal;
});

// ----- Doors (cave entrances / exits) -----
let lastTile = { x: Math.floor(player.x), y: Math.floor(player.y) };
let fade = 0;

function checkDoors(): void {
  const tx = Math.floor(player.x);
  const ty = Math.floor(player.y);
  if (tx === lastTile.x && ty === lastTile.y) return;
  lastTile = { x: tx, y: ty };
  // Only stepping ONTO a door square counts, so arriving next to one doesn't bounce you back.
  const door = doorAt(world.current, tx, ty);
  if (!door) return;
  world.goThrough(door);
  player.placeAt(door.toX + 0.5, door.toY + 0.5);
  lastTile = { x: door.toX, y: door.toY };
  target = null;
  const t = cameraTarget();
  camera.snap(t.x, t.y, world.current);
  fade = 1;
  autosave.now(); // remember which map he's on
}

// ----- Game loop -----
let time = 0;
startLoop(
  (dt) => {
    time += dt;
    encounter.update(dt);
    parentArea.update();
    howToPlay.update(dt);
    autosave.update(dt); // saves every 5 s if Layne has moved (even while a screen is open)

    // Music: exciting while catching, quiet for the result (so the fanfare shines), cave or explore otherwise.
    if (encounter.isOpen) music.play(encounter.isCatching ? 'catch' : null);
    else music.play(world.current.kind === 'cave' ? 'cave' : 'explore');
    fade = Math.max(0, fade - dt * 2.5);
    // The world waits while a monster, the book, the how-to-play or the grown-ups area is open.
    if (encounter.isOpen || book.isOpen || parentArea.isOpen || howToPlay.isOpen) return;
    encounterCooldown = Math.max(0, encounterCooldown - dt);

    const kb = keyboard.direction();
    const input = kb.x || kb.y ? kb : pointer.direction(layneOnScreen());
    player.update(dt, input, world.current);

    // While a finger steers, the brackets show where it is. Otherwise they show the tap-to-walk goal.
    const steer = pointer.steerPoint();
    if (steer) target = tileUnder(steer.x, steer.y);
    else if (!player.hasPath) target = null;

    checkDoors();
    const t = cameraTarget();
    camera.follow(t.x, t.y, world.current, dt);
    badge.show(biomeAt(world.current, Math.floor(player.x), Math.floor(player.y)));
    worldMap.update(world.current, player.x, player.y, time);

    const bumped = wild.update(dt, world.current, player.x, player.y);
    if (bumped && encounterCooldown <= 0) {
      meeting = bumped;
      pointer.release(); // a finger that was steering shouldn't keep steering afterwards
      player.setPath([]);
      target = null;
      encounter.show(bumped.monster);
    }
  },
  () => renderer.draw({ map: world.current, camera, player, glasses, wild: wild.list, target, fade, time }),
);

// Dev only: peek at the game from the browser console (e.g. __lmq.wild.list). Removed from `npm run build`.
if (import.meta.env.DEV) Object.assign(window, { __lmq: { world, player, wild, encounter, book, parentArea, howToPlay, autosave, save, renderer, camera } });

// No pinch-zoom, double-tap zoom or long-press menus during play.
preventTabletZoom();

// Works offline once installed: a service worker keeps copies of the game's OWN files.
// (Only in the real build; during `npm run dev` it would get in the way of hot reload.)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js').catch(() => {
    // Not supported or blocked: the game still works, just not offline.
  });
}
