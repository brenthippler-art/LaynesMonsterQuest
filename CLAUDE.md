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
- Worlds may be inspired by real places, but use original names, and no real logos, mascots, brand colors used as a logo, or menu item names.
- Monster ids and names are unique across ALL worlds. World ids, monster ids and map ids are saved: never change them once shipped. New worlds' map ids are `<worldId>/<mapName>`.
- Indoor / real-place worlds use the building engine (`src/worlds/building/`): draw the maps as ASCII templates, list tiles, decorations and realms. Every walkable square must be reachable from the start (checked on `/gallery`).
- Monster rules for every world after the island are in `src/monsters/newWorldRules.ts` (2 rare / 4 uncommon / 6 common per realm, creature and object mix, name and text lengths).
- `/gallery` must show zero problems.

## Tech

- Vite + TypeScript. HTML5 Canvas for the world, plain DOM/CSS for menus.
- No game framework unless the reason is explained to the user and they agree first.
- Save data goes in localStorage under one key, `lmq-save-v1`, with a `version` field and a migration step for every version change.
- Must work on a tablet (touch, portrait AND landscape) and on desktop (keyboard + mouse).
- Static build that deploys to Vercel.

## Working style

- The user is a frontend developer who learns by typing the changes themselves. For each task, explain what changed and why, file by file, in plain language.
- Keep files small and well-named.
- After each task, give exact steps for testing it in the browser.
