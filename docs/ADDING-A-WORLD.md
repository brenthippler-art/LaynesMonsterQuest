# Adding a world (checklist)

A new world (a farm, a zoo, a grocery store…) should fit in one prompt. Use
`src/worlds/home/` and `src/monsters/worlds/home.ts` as the example to copy
(and `src/worlds/wonderwhirl/` for rides). Rules are in `CLAUDE.md`.

What a world is made of: **template** (the ASCII maps) · **realms** · **tiles** ·
**decorations** · **music** · **card picture** · **108 monsters** · **the checker**.
The steps below go through them in that order. There's a prompt you can copy at the end.

## 0. Plan it
- [ ] Pick an **id** (lowercase, permanent: it goes into saves) and a short **name**.
- [ ] Pick **9 realms**: an id (lowercase) and ONE short uppercase badge word each (e.g. `KITCHEN`).
- [ ] Inspired by a real place? Fine, but original names only: no real logos, mascots, brand colors used as a logo, or menu item names.

## 1. Register the id
- [ ] Add the id to `WORLD_IDS` in `src/worlds/worldIds.ts`.

## 2. Tiles: `src/worlds/<id>/tiles.ts`
- [ ] One entry per kind of square: `walkable`, a corner-map `color` (walls dark so rooms look outlined), and a `draw` function (helpers in `src/worlds/building/paint.ts`).
- [ ] Mark gaps between rooms as `doorway: true` (furniture never blocks them).
- [ ] Include stairs or ladders if the world has extra maps.

## 3. Decorations: `src/worlds/<id>/decor/*.ts`
- [ ] Pixel art up to 16×16, letters from `SPRITE_COLORS` in `src/render/decorArt.ts`.
- [ ] `solid: true` for furniture that blocks walking; `place: 'wall' | 'open'`; `on: [...]` to limit which tiles it stands on.
- [ ] A few files of 2-3 rooms each, so files stay small.

## 4. Layout: `src/worlds/<id>/layout.ts`
- [ ] A **legend**: character → `{ tile, decor?, link?, arrive?, spawn?, face? }` (`face` on the spawn square picks which way Layne looks when the world starts: `'up'`, `'down'`, `'left'` or `'right'`).
- [ ] The **main map** first (about 90×70: walking across should take under a minute), then any extra maps.
- [ ] A **zones** template the same size as each map: the realm's zone letter, `.` for walls and doorways.
- [ ] Exactly one `spawn` square. Stairs: the same `link` name on both maps, and `arrive` on the side that keeps you walking AWAY from them.
- [ ] Rooms big enough for 3-4 wandering monsters.

## 5. Realms: `src/worlds/<id>/realms.ts`
- [ ] For each realm: `id`, `label`, `zone`, `icon` (a decoration name), `music`, `scatter` (decoration → how many), `scene` (wall, floor, 3 decorations for the encounter background), `printDecor` (coloring-page edge pictures).

## 6. Music and card picture
- [ ] A song in `src/audio/tracks.ts` (add its name to `SongName`; every part the same number of steps).
- [ ] A ~32×18 card picture in `src/worlds/<id>/scene.ts`.

## 7. Put it together
- [ ] `src/worlds/<id>/index.ts`: `makeBuildingWorld({ id, name, seed, scene, tiles, decor, legend, maps, realms })`.
- [ ] Add it to `WORLDS` in `src/worlds/index.ts`. (It appears in the world picker, book and gallery by itself.)
- [ ] Optional: `rides` for things that move (a Ferris wheel turning, cars rolling). Each ride covers squares Layne can't walk on, and its `pose(time)` says where its little pictures go each frame (see `src/worlds/wonderwhirl/rides/` and `src/worlds/building/rides.ts`). `/gallery` reports a ride that covers a walkable square.

## 8. Monsters: `src/monsters/worlds/<id>.ts`
- [ ] 108 monsters, **12 per realm: 2 rare, 4 uncommon, 6 common**.
- [ ] Per realm, besides the rares: at least 4 creatures (dragon, serpent, beast, bird, long, bugs, fish) and 2 living objects (bowl, appliance, cart, square); at most 4 round/blob bodies; at least 5 body shapes; no two with the same body AND main color.
- [ ] Names: one word, 2-4 syllables, no "-mon", unique across ALL worlds, not one letter from another name (`/gallery` checks these), nothing that sounds like a brand or character (check by eye; list doubtful ones for a grown-up).
- [ ] Ids: lowercase, unique across ALL worlds, and permanent once shipped (saves use them). Names can change later; ids can't.
- [ ] Ability: 2-3 word name (unique in the world), one cheerful sentence under 12 words. Fact: one sentence under 15 words.
- [ ] Rares look the most impressive (bigger, extra parts, crown or glow).
- [ ] Write ONE realm at a time and check `/gallery` after each.
- [ ] Add the list to `MONSTERS` in `src/monsters/worlds/index.ts`.

## 9. Check it
- [ ] `npm run typecheck`
- [ ] `/gallery`: zero problems (monster rules, look-alikes, one-letter names AND "every square reachable").
- [ ] `/gallery` with the world filter: no two monsters in a realm that are hard to tell apart by eye (the checker only catches the same body in the same or nearly the same color).
- [ ] `/gallery#saves`: every save check passes (only matters if the save code changed).
- [ ] Play it: every room's badge, every staircase both ways, the corner map, an encounter background, the book tab, the world's card, a coloring page (grown-ups area → its world → a realm).
- [ ] The console says `<World name>: first frame in … ms`: well under 1000 ms.
- [ ] `npm run build`, then `npm run check:build` ("All good"), then the offline check from README.md.
- [ ] Update `README.md`: the worlds table, and the monster count at the top (108 more per world).

## A prompt you can copy

> Read CLAUDE.md and docs/ADDING-A-WORLD.md first. Add a new world to Layne's Monster
> Quest: **[name]** (id `[id]`), inspired by **[a place]**. It's [indoors / outdoors],
> about 90×70 squares. The 9 realms are: [realm 1: what's there], [realm 2: …], … [realm 9].
> Layne starts at [where], facing [which way]. Things that should move: [none / a ride, …].
> The song should feel [cheerful / sleepy / bouncy…]. Rare monsters: [2 ideas per realm, or
> "you pick"]. Follow every step of the checklist, show me any doubtful names before you
> use them, and explain what changed file by file so I can type it myself, with test steps.
