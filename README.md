# Layne's Monster Quest

A gentle, NES-style pixel-art exploring game made for a 6-year-old. Layne walks
around a big island (grassland, forest, desert, snow, mountains, beaches,
swamps, a volcano and underground caves) and finds 108 original monsters that
live in the places that suit them.

- **No losing, ever.** A catch that doesn't work out just means the monster hops off to play; you can find it again.
- **No reading needed.** Icons, pictures and a wordless how-to-play.
- **Works on tablets and computers:** tap or hold to walk, or use the arrow keys / WASD.
- **Totally offline and private.** The game never talks to the internet: no accounts, chat, ads, analytics or sharing.

What's in it:

| | |
|---|---|
| World | 200×200 tile island from a fixed seed (the same every time), 6 caves |
| Monsters | 108 original monsters, 12 per habitat, drawn from parts as 16-bit pixel art |
| Catching | Tap when the shrinking ring is in the green zone; 3 tries |
| Monster Book | Every monster you've found, with silhouettes for the rest |
| Coloring pages | Print any found monster as a line-art coloring page (US Letter) |
| Music & sound | Chiptune music and sound effects, all generated in code |
| Grown-ups area | Hold the gear for 3 seconds: export/import the save, reset, print all, how-to-play |

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
| `/gallery` | Every monster of every world, in color and as coloring pages, with data checks per world |
| `/devices` | The game at iPad and phone sizes, portrait and landscape, side by side |

In the browser console during `npm run dev`, `__lmq` lets you peek at the game
(for example `__lmq.save` or `__lmq.wild.list`).

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
| Worlds and their 9 realms (labels, icons, music) | `src/worlds/` (the island is `src/worlds/island/`) |
| Monster names, abilities, facts, colors, looks | `src/monsters/worlds/` (one file per world, e.g. `island.ts`) |
| Monster body parts (ears, tails, eyes…) | `src/monsters/art/` |
| Layne's pixel art | `src/render/layneSprites.ts` |
| Trees, cacti and other decorations | `src/render/decorSprites.ts` |
| The music (written as text!) | `src/audio/tracks.ts` |
| Sound effects | `src/audio/sfx.ts` |
| World size and seed, walking speed | `src/config.ts` |
| How the island is shaped | `src/world/overworld.ts`, `src/world/biomes.ts` |
| Catch difficulty | `RULES` in `src/encounters/catchRing.ts` |
| Save format | `src/save/save.ts` |

Project rules (for people and AI helpers) are in `CLAUDE.md`.
