# Layne's Monster Quest

A gentle, NES-style pixel-art exploring game made for a 6-year-old. Layne picks
a world, walks around it, and finds original monsters that live in the places
that suit them. Every world has 9 realms and 108 monsters (216 so far).

- **No losing, ever.** A catch that doesn't work out just means the monster hops off to play; you can find it again.
- **No reading needed.** Icons, pictures and a wordless how-to-play.
- **Works on tablets and computers:** tap or hold to walk, or use the arrow keys / WASD.
- **Totally offline and private.** The game never talks to the internet: no accounts, chat, ads, analytics or sharing.

What's in it:

| | |
|---|---|
| Worlds | See the table below. Each world has 9 realms with 12 monsters each (2 rare) |
| Monsters | 216 original monsters, drawn from parts as 16-bit pixel art |
| Catching | Tap when the shrinking ring is in the green zone; 3 tries |
| Monster Book | A tab per world, a section per realm (found / 12); silhouettes for the ones not found yet |
| Coloring pages | Print any found monster as a line-art coloring page (US Letter), or a whole world or realm from the grown-ups area |
| Music & sound | Chiptune music and sound effects, all generated in code |
| Title & worlds | Title screen with a big PLAY button (carries on where Layne left off) and a world picker: one card per world with its progress |
| Grown-ups area | Hold the gear for 3 seconds: export/import the save, reset, print a world or a realm, how-to-play |

### The worlds

| World | id | Map | Realms | Monsters |
|---|---|---|---|---|
| Island | `island` | 200×200 island from a fixed seed, 6 caves | grass, forest, desert, snow, hills, beach, swamp, volcano, cave | 108 |
| Home Sweet Home | `home` | 90×70 house and yard (drawn as ASCII), attic and basement | kitchen, living, bath, bedroom, laundry, garage, attic, basement, yard | 108 |

New worlds are added with one checklist: see [docs/ADDING-A-WORLD.md](docs/ADDING-A-WORLD.md).

### Monster art parts

Every monster is built from parts (see `src/monsters/art/`):

| Part | Choices |
|---|---|
| Body | round, pear, tall, square, long, drop, cloud, spiky, blob, crystal · **dragon, serpent, beast, bird** (separate head) · **bowl, appliance, cart** (living objects) |
| Top | none, cat, bunny, round, horns, antennae, leaf, flame, crystals, tuft, spikes, fins, mushroom · **dragonhorns, unihorn, mane, frill, crown, chefhat, lid** (+ an optional `extraTop`) |
| Arms | none, nubs, wings, bird, insect, pincers, leaves, flippers · **dragonwings, feathers, claws** |
| Feet | none, stubs, paws, four, flippers, tentacles · **claws, hooves, wheels** |
| Tail | none, puff, curl, leaf, flame, fish, zigzag, long, spiky, fluffy · **dragon, serpent, plume** |
| Eyes / mouth | dot, round, big, happy, sleepy, cyclops, stalks / smile, open, fang, beak, cat, o, grin, **snout** |
| Pattern | none, spots, stripes, glow, cracks, patches · **scales, checks, sprinkles** |
| Heads | 1 (default), 2 or 3 |
| Types | Leaf, Frost, Sand, Stone, Splash, Ember, Shadow, Zap, Fluff · **Snack, Bubble, Toy, Sparkle, Gear** |

Bold = added for the newer worlds. `/gallery#parts` shows every one at all sizes.

---

## Run it on your computer

You need Node.js version 20 or newer (install it from the official Node.js website).

```bash
npm install        # once
npm run dev        # start the game at http://localhost:5173
```

Developer pages (only while `npm run dev` is running, never part of the real game):

| Address | What it is |
|---|---|
| `/gallery` | Every monster of every world, in color and as coloring pages, with data checks per world, and filters (one world, rares only). The **Parts** tab (`/gallery#parts`) shows every body and part at all 4 sizes, plus 6 gallery-only test monsters with a coloring-page print check |
| `/devices` | The game at iPad and phone sizes, portrait and landscape, side by side |

In the browser console during `npm run dev`, `__lmq` lets you peek at the game
(for example `__lmq.save`, `__lmq.screen`, `__lmq.session.wild.list`, or
`__lmq.renderer.chunks.size`, which drops to 0 whenever Layne leaves a world).

### Try it on a real tablet

```bash
npm run dev -- --host
```

Then open the "Network" address it prints (for example `http://192.168.x.x:5173`)
on a tablet on the same Wi-Fi.

### Other commands

| Command | Does |
|---|---|
| `npm run build` | Type-checks and builds the finished game into `dist/` |
| `npm run preview` | Serves `dist/` locally, to try the real build (including offline mode) |
| `npm run typecheck` | Just the TypeScript check |
| `npm run icons` | Re-makes the app icons in `public/icons/` from Layne's pixel art |

---

## Put it online with Vercel

The project is ready for Vercel as-is (`vercel.json` sets the build, the output
folder and security headers).

**Option A: from GitHub (easiest):**

1. Put the project in a GitHub repository (if the folder isn't a git repository yet: `git init`, `git add .`, `git commit -m "First version"`, then push it to a new GitHub repository).
2. In the Vercel dashboard choose **Add New → Project** and pick the repository.
3. Vercel detects Vite. Keep the defaults: build command `npm run build`, output directory `dist`.
4. Press **Deploy**. Every push to the main branch deploys again automatically.

**Option B: from your computer:**

```bash
npx vercel          # first time: log in and link the project (a preview deploy)
npx vercel --prod   # deploy to the real address
```

### Add it to a tablet's home screen

Open the game's address in the tablet's browser, then:

- **iPad / iPhone (Safari):** Share button → **Add to Home Screen**
- **Android (Chrome):** ⋮ menu → **Add to Home screen** / **Install app**

It then opens full-screen like an app, and after the first visit it works
**offline**: a small service worker keeps copies of the game's own files.
Every world is inside the one game file, so every world works offline.

To check offline play on a computer: `npm run build`, `npm run preview`, open
the address once and visit each world, then stop the preview server (Ctrl+C)
or turn off Wi-Fi, reload, and play each world.

**Known limitation:** on iPad/iPhone, printing coloring pages may not work from
the Home Screen app (an iOS restriction). If nothing happens, open the game in
Safari itself and print from there. The grown-ups area shows this tip on iOS.

---

## How saving works

Everything is stored **only in the browser on that device** (`localStorage`),
in **one key**: `lmq-save-v1`. Nothing is sent anywhere.

### What's saved

```jsonc
{
  "version": 5,
  "lastGlasses": 17,            // so Layne's glasses can change every visit
  "muted": false,
  "players": {                  // where Layne is in each world (by world id)
    "island": { "map": "cave-3", "x": 16.5, "y": 4.5, "facing": "up" }
  },
  "lastWorld": "island",        // the world he was in last (null = new game)
  "collection": {               // one list for ALL worlds (monster ids are unique across worlds)
    "hopsy": { "count": 3, "firstFound": "2026-11-05T14:52:55.400Z" }
  },
  "tutorialSeen": true
}
```

### When it saves

- every 5 seconds, if Layne has moved
- right after every catch, door, or settings change
- when the page is hidden or closed (switching apps, closing the tab)

On start-up the save loads automatically and Layne appears exactly where he left
off (in the same world, on the same map, facing the same way). Each world
remembers its own spot. Island map ids are `overworld` and `cave-1`…`cave-6`;
newer worlds name their maps `<worldId>/<mapName>` so they can never clash.
A spot for a world id the game doesn't know is quietly dropped.

### Versions and upgrades

The `version` number goes up whenever the save's shape changes, and
`migrate()` in `src/save/save.ts` upgrades old saves step by step
(v1 → v2 → v3 → v4 → v5; v5 moved `player` into `players.island`), so progress is never lost when the game is updated.
To add a new field: bump the version, add one upgrade step, and give the
field a sensible default.

### Damaged saves

The game **never crashes** because of a bad save:

- If the save can't be read (broken data, or a version from the future), a copy
  goes to a **backup key**, `lmq-save-v1-backup`, and a fresh game starts.
  The grown-ups area shows a note and offers the backup as a download.
- Small problems inside a good save (a weird number, a bad date, a spot
  inside a mountain) are cleaned up quietly instead.
- Resetting or importing also keeps a backup of the save it replaces.

### Moving progress between devices

In the grown-ups area (hold the gear, bottom-right, for 3 seconds):

1. **Download save file** on the first device. You get `laynes-monster-quest-save-YYYY-MM-DD.json`.
2. Move the file (AirDrop, USB, email to yourself…).
3. **Load save file…** on the other device and confirm.

There's no cloud sync, on purpose.

---

## Safety

- A strict **Content-Security-Policy** is in `index.html` (and repeated as an
  HTTP header in `vercel.json`): the page may only load files from its own
  site, and `connect-src 'none'` forbids any network requests.
- No fonts, scripts, images or sounds come from anywhere else. Pictures and
  sounds are generated in code.
- No messaging, accounts, sign-in, leaderboards, sharing, links or ads.
- The service worker only ever handles requests for the game's own files.

---

## Where things are (for tinkering)

| To change… | Look in |
|---|---|
| Worlds and their 9 realms (labels, icons, music) | `src/worlds/` (the island is `src/worlds/island/`, Home Sweet Home is `src/worlds/home/`) |
| The house's layout (ASCII map you can retype) | `src/worlds/home/layout.ts` |
| Building-world engine (templates → maps, furniture scatter, reach check) | `src/worlds/building/` |
| Monster names, abilities, facts, colors, looks | `src/monsters/worlds/` (one file per world, e.g. `island.ts`) |
| Monster body parts (ears, tails, eyes…) | `src/monsters/art/` (one file per group: `bodies.ts`, `creatureBodies.ts`, `objectBodies.ts`, `tops.ts`, `creatureTops.ts`, `hats.ts`, `limbs.ts`, `creatureLimbs.ts`, `wings.ts`, `creatureTails.ts`, `face.ts`, `patterns.ts`, `heads.ts`) |
| Layne's pixel art | `src/render/layneSprites.ts` |
| Trees, cacti and other decorations | `src/render/decorSprites.ts` |
| The music (written as text!) | `src/audio/tracks.ts` |
| Title screen, world picker | `src/screens/` |
| Playing in one world (Layne, doors, wild monsters) | `src/game/worldSession.ts` |
| Switching between title, picker and worlds | `src/main.ts` |
| Sound effects | `src/audio/sfx.ts` |
| World size and seed, walking speed | `src/config.ts` |
| How the island is shaped | `src/world/overworld.ts`, `src/world/biomes.ts` |
| Catch difficulty | `RULES` in `src/encounters/catchRing.ts` |
| Save format | `src/save/save.ts` |

Project rules (for people and AI helpers) are in `CLAUDE.md`.
