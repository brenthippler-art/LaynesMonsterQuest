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

## Tech

- Vite + TypeScript. HTML5 Canvas for the world, plain DOM/CSS for menus.
- No game framework unless the reason is explained to the user and they agree first.
- Save data goes in localStorage under one versioned key (e.g. `lmq-save-v1`), with a migration function for future versions.
- Must work on a tablet (touch, portrait AND landscape) and on desktop (keyboard + mouse).
- Static build that deploys to Vercel.

## Working style

- The user is a frontend developer who learns by typing the changes themselves. For each task, explain what changed and why, file by file, in plain language.
- Keep files small and well-named.
- After each task, give exact steps for testing it in the browser.
