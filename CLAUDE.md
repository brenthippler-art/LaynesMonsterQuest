# Layne's Monster Quest

A browser game for a 6-year-old named Layne. Layne (a boy) explores an open world with different terrains and climates and collects monsters that live in habitats that suit them.

These rules apply to every task in this project.

## Audience rules (6-year-old player)

- Keep reading to a minimum. Use icons, big buttons, and short words. Every important action must work without reading.
- No losing, no game over, no punishment. A failed catch just means the monster wanders off and can be found again.
- Bright, friendly, non-scary art. No violence: monsters "play" instead of fighting.
- Touch targets are at least 64px.

## Hard safety rules (never break these)

- The game makes ZERO network requests to any other site. No CDNs, Google Fonts, analytics, external images, APIs, or AI services. Everything is bundled locally.
- `index.html` must include this Content-Security-Policy meta tag:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; frame-src 'none'; form-action 'none'">
  ```
- No chat, messaging, accounts, sign-in, leaderboards, share buttons, external links, or ads.
- Every monster is an ORIGINAL design. Do not copy or imitate characters or names from Pokémon or any other existing franchise.

## Worlds

- The game has several worlds (registry in `src/worlds/`, monsters in `src/monsters/worlds/`).
- Every world has exactly 9 realms and 108 monsters: 12 per realm, exactly 2 rare per realm (the island, made first, may have fewer).
- In every world, every realm: at most 4 round/blob bodies, and no two monsters with the same body AND the same (or a nearly identical) main color. `/gallery` checks both.
- Names: one word, 2-4 syllables, easy to say, no "-mon" ending, not one letter away from another monster's name in ANY world (`/gallery` checks this), and nothing that sounds like a brand, product or famous character (Pokémon included: no "-eon" endings or near-copies). Code can't check the brand rule: show the user any doubtful names before shipping.
- Renaming a monster is safe for saves (saves store ids, not names), but change the name everywhere it appears (its `fact` often says it).
- Friendly art only: round eyes, rounded teeth, soft shapes.
- To add a world, follow docs/ADDING-A-WORLD.md.
- Worlds may be inspired by real places, but use original names, and no real logos, mascots, brand colors used as a logo, or menu item names.
- Monster ids and names are unique across ALL worlds. World ids, monster ids and map ids are saved: never change them once shipped. New worlds' map ids are `<worldId>/<mapName>`.
- Indoor / real-place worlds use the building engine (`src/worlds/building/`): draw the maps as ASCII templates, list tiles, decorations and realms. Every walkable square must be reachable from the start (checked on `/gallery`).
- Monster rules for every world after the island are in `src/monsters/newWorldRules.ts` (2 rare / 4 uncommon / 6 common per realm, creature and object mix, name and text lengths).
- `/gallery` must show zero problems, `/gallery#saves` must pass every save check, and after `npm run build`, `npm run check:build` must say "All good".
- Leaving a world must free everything it made (maps, wandering monsters, map pictures): keep caches outside a WorldSession either bounded (one entry per monster or realm) or emptied in `leaveWorld()` in `src/main.ts`.
- Every world is in the one game bundle, so the service worker caches all of them. If worlds are ever split into separate files, `npm run check:build` still checks that every built file is cached.

## 3D worlds (Nintendo 64 style)

- A world is drawn in 3D when its WorldDef has `view: '3d'` (the Island first; the others are still 2D until they're converted).
- The game itself doesn't change in 3D: maps, walls, doors, wandering monsters, catching and saves all still work in squares (tiles). `src/world3d/` only DRAWS that world in 3D, so saves are the same in 2D and 3D.
- The look: low-poly shapes with plain colors and flat faces, drawn small (about 360 pixels tall) and stretched up with crisp pixels, fog in the distance, round blob shadows. No picture files (textures): every color is set in code.
- 3D monsters are built from each monster's own art data (body, eyes, top, tail, feet, arms, pattern) in `src/world3d/monsters/`, so every monster gets a 3D model automatically. Keep new art parts working in both `src/monsters/art/` and `src/world3d/monsters/`.
- Layne must never be lost from view: when something is in front of him he shows through as a blue shadow.
- Extra 3D controls: jump (Space or the jump button) and turn the camera (Q / E or the two arrow buttons). Walking is the same as 2D. Every button is at least 64px.
- Leaving a world must free its 3D pieces too: `View3D.leave()` (called from `leaveWorld()` in `src/main.ts`) drops the ground chunks and the monster models.

## Tech

- Vite + TypeScript. HTML5 Canvas for 2D worlds, three.js for 3D worlds, plain DOM/CSS for menus.
- No game framework unless the reason is explained to the user and they agree first. three.js is a drawing library, not a game framework: it only draws the 3D worlds, and the game's own code runs everything else. It's installed from npm at an exact version and bundled into the game (never loaded from a CDN).
- Save data goes in localStorage under one key, `lmq-save-v1`, with a `version` field and a migration step for every version change.
- Must work on a tablet (touch, portrait AND landscape) and on desktop (keyboard + mouse).
- Static build that deploys to Vercel.

## Working style

- The user is a frontend developer who learns by typing the changes themselves. For each task, explain what changed and why, file by file, in plain language.
- Keep files small and well-named.
- After each task, give exact steps for testing it in the browser.
