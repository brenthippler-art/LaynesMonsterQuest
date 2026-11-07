# Adding a world (checklist)

A new world should fit in one prompt. Use `src/worlds/home/` and
`src/monsters/worlds/home.ts` as the example to copy. Rules are in `CLAUDE.md`.

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
- [ ] A **legend**: character → `{ tile, decor?, link?, arrive?, spawn? }`.
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

## 8. Monsters: `src/monsters/worlds/<id>.ts`
- [ ] 108 monsters, **12 per realm: 2 rare, 4 uncommon, 6 common**.
- [ ] Per realm, besides the rares: at least 4 creatures (dragon, serpent, beast, bird, long, bugs, fish) and 2 living objects (bowl, appliance, cart, square); at most 4 round/blob bodies; at least 5 body shapes; no two with the same body AND main color.
- [ ] Names: one word, 2-4 syllables, no "-mon", unique across ALL worlds, not one letter from another name, nothing that sounds like a brand or character.
- [ ] Ability: 2-3 word name (unique in the world), one cheerful sentence under 12 words. Fact: one sentence under 15 words.
- [ ] Rares look the most impressive (bigger, extra parts, crown or glow).
- [ ] Write ONE realm at a time and check `/gallery` after each.
- [ ] Add the list to `MONSTERS` in `src/monsters/worlds/index.ts`.

## 9. Check it
- [ ] `npm run typecheck`
- [ ] `/gallery`: zero problems (monster rules AND "every square reachable").
- [ ] `/gallery` with the world filter: no two monsters in a realm that are hard to tell apart.
- [ ] Play it: every room's badge, every staircase both ways, the corner map, an encounter background, the book tab, a coloring page.
- [ ] `npm run build`, `npm run preview`, then the offline check from README.md.
- [ ] Update the worlds table in `README.md`.
