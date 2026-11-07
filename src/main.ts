import './style.css';
import { music } from './audio/music';
import { sfx } from './audio/sfx';
import { MonsterBook } from './book/monsterBook';
import { startLoop } from './core/loop';
import { EncounterScreen } from './encounters/encounterScreen';
import { WorldSession } from './game/worldSession';
import { Keyboard } from './input/keyboard';
import { preventTabletZoom } from './input/noZoom';
import { PointerControls } from './input/pointerControls';
import { ParentArea } from './parent/parentArea';
import { GLASSES_STYLES, pickNewGlasses } from './player/glasses';
import { Camera } from './render/camera';
import { setupCanvas } from './render/canvas';
import { Renderer } from './render/renderer';
import { AutoSave } from './save/autosave';
import { loadSave, recordFound } from './save/save';
import { TitleScreen } from './screens/titleScreen';
import { WorldPicker } from './screens/worldPicker';
import { HowToPlay } from './tutorial/howToPlay';
import { HomeButton } from './ui/homeButton';
import { MuteButton } from './ui/muteButton';
import { PixelWipe } from './ui/pixelWipe';
import { RealmBadge } from './ui/realmBadge';
import { WorldMap } from './ui/worldMap';
import { WORLDS } from './worlds';
import { DEFAULT_WORLD, type WorldId } from './worlds/worldIds';

/**
 * The game's "shell". It owns the things that last the whole visit (the save,
 * sound, the canvas, buttons and pop-up screens) and switches between:
 *
 *   title  ──PLAY──►  world  (the last world played; no last world → picker)
 *     │                 ▲
 *   WORLDS            card tap
 *     ▼                 │
 *   picker ─────────────┘          and the in-game home button goes back to the title.
 *
 * Everything about ONE world lives in a WorldSession, made when Layne enters a
 * world and dropped when he leaves (together with the map picture caches).
 */
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLElement;
// alpha: false = the canvas is never see-through, which lets the browser draw it faster.
const ctx = canvas.getContext('2d', { alpha: false })!;

// ----- Load the save (a damaged save is backed up and a new game starts; it never crashes) -----
const { data: save, recovered } = loadSave();

/** The world Layne is in (null on the title screen and world picker). */
let session: WorldSession | null = null;
type ScreenName = 'title' | 'picker' | 'world';
let screen: ScreenName = 'title';

const autosave = new AutoSave(save, () => session?.whereabouts() ?? null);
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

// ----- Drawing and controls (one of each for the whole visit, shared by every world) -----
const camera = new Camera();
const renderer = new Renderer(ctx);
const keyboard = new Keyboard();
const pointer = new PointerControls(canvas, (cssX, cssY) => session?.tap(cssX, cssY));

// ----- In-world pieces: the corner sign and map, the book, home, the encounter screen -----
// They live in one layer that's hidden on the title screen and world picker.
const hud = document.createElement('div');
hud.className = 'hud';
hud.hidden = true;
ui.append(hud);
const badge = new RealmBadge(hud);
const worldMap = new WorldMap(hud);
const book = new MonsterBook(hud, save, () => session?.def ?? WORLDS[save.lastWorld ?? DEFAULT_WORLD]);
new HomeButton(hud, goHome);
const encounter = new EncounterScreen(
  hud,
  (m) => {
    const record = recordFound(save, m.id);
    autosave.now(); // save right after every catch
    return record.count;
  },
  () => session?.endEncounter(),
);

// ----- Screens. (Made before the grown-ups area, so its Escape key is seen after theirs.) -----
const wipe = new PixelWipe(ui);
const title = new TitleScreen(ui, glasses, { onPlay: play, onWorlds: showPicker });
const picker = new WorldPicker(ui, {
  onPick: enterWorld,
  onBack: showTitle,
  canUseKeys: () => !howToPlay.isOpen && !parentArea.isOpen && !wipe.isRunning,
});

new MuteButton(ui, save.muted, (muted) => {
  save.muted = muted;
  autosave.now();
});

// ----- Picture "how to play": shown once for the whole game (and again from the grown-ups area) -----
const howToPlay = new HowToPlay(ui, glasses, () => {
  save.tutorialSeen = true;
  autosave.now();
  title.focus(); // back on the title screen? Enter starts the game again
});
const parentArea = new ParentArea(ui, save, autosave, recovered, () => howToPlay.open());

// ----- Moving between screens -----

function showTitle(): void {
  screen = 'title';
  picker.hide();
  hud.hidden = true;
  title.show(save);
}

function showPicker(): void {
  sfx.click();
  screen = 'picker';
  title.hide();
  picker.show(save, session?.def.id ?? save.lastWorld);
}

/** PLAY: carry on in the last world played. Never played? Choose a world first. */
function play(): void {
  if (save.lastWorld) enterWorld(save.lastWorld);
  else showPicker();
}

/** Whoosh, wipe, and arrive in a world: at Layne's spot from last time, or its start on a first visit. */
function enterWorld(id: WorldId): void {
  if (wipe.isRunning) return;
  sfx.whoosh();
  wipe.run(() => {
    leaveWorld();
    session = new WorldSession(WORLDS[id], save.players[id], camera);
    autosave.now(); // remembers lastWorld = this world (and his spot in it)
    title.hide();
    picker.hide();
    hud.hidden = false;
    screen = 'world';
  });
}

/** The home button: save, wipe, back to the title screen. */
function goHome(): void {
  if (wipe.isRunning) return;
  sfx.click();
  wipe.run(() => {
    leaveWorld();
    showTitle();
  });
}

/**
 * Let go of the current world completely: save his spot, then drop the session
 * (its maps and wandering monsters) and empty the map picture caches, so
 * memory doesn't grow while Layne hops between worlds.
 */
function leaveWorld(): void {
  if (!session) return;
  autosave.now();
  session = null;
  renderer.forgetMaps();
  worldMap.forgetMaps();
  pointer.release();
}

setupCanvas(canvas, (vp) => {
  camera.resize(vp);
  session?.snapCamera();
});

// ----- Game loop -----
let time = 0;
startLoop(
  (dt) => {
    time += dt;
    encounter.update(dt);
    parentArea.update();
    howToPlay.update(dt);
    title.update(dt);
    autosave.update(dt); // saves every 5 s if Layne has moved (even while a screen is open)

    if (!session || screen !== 'world') {
      music.play('title');
      return;
    }
    session.tick(dt);
    // Music: exciting while catching, quiet for the result (so the fanfare shines), otherwise the realm's own song.
    if (encounter.isOpen) music.play(encounter.isCatching ? 'catch' : null);
    else music.play(session.realm.music);
    // The world waits while a monster, the book, the how-to-play or the grown-ups area is open.
    if (encounter.isOpen || book.isOpen || parentArea.isOpen || howToPlay.isOpen) return;

    const kb = keyboard.direction();
    const input = kb.x || kb.y ? kb : pointer.direction(session.layneOnScreen());
    const { bumped, movedMap } = session.update(dt, input, pointer.steerPoint());
    if (movedMap) autosave.now(); // remember which map he's on
    badge.show(session.realm);
    worldMap.update(session.world.current, session.player.x, session.player.y, time);
    if (bumped) {
      pointer.release(); // a finger that was steering shouldn't keep steering afterwards
      encounter.show(bumped.monster, bumped.home.realm.encounterBg);
    }
  },
  () => {
    if (session) renderer.draw({ ...session.scene(), camera, glasses, time });
    else renderer.clear(camera.viewW, camera.viewH);
  },
);

// ----- Start on the title screen (the how-to-play shows on top, the very first time) -----
showTitle();
if (!save.tutorialSeen) {
  howToPlay.open();
  (document.activeElement as HTMLElement | null)?.blur(); // so Space / Enter can't press PLAY underneath it
}

// Dev only: peek at the game from the browser console (e.g. __lmq.session.wild.list). Removed from `npm run build`.
if (import.meta.env.DEV) {
  Object.assign(window, {
    __lmq: {
      get session() {
        return session;
      },
      get screen() {
        return screen;
      },
      book, encounter, parentArea, howToPlay, autosave, save, renderer, camera, title, picker,
    },
  });
}

// No pinch-zoom, double-tap zoom or long-press menus during play.
preventTabletZoom();

// Works offline once installed: a service worker keeps copies of the game's OWN files.
// (Only in the real build; during `npm run dev` it would get in the way of hot reload.)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js').catch(() => {
    // Not supported or blocked: the game still works, just not offline.
  });
}
