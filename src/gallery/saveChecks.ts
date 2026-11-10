import { BACKUP_KEY, type KeyValueStore, loadSave, migrate, SAVE_KEY, type SaveData } from '../save/save';
import { readSaveFile, saveFileText } from '../save/transfer';

/**
 * DEV-ONLY save checks, shown on /gallery#saves. Each check feeds the save code an old,
 * broken or unusual save and looks at what comes out. They use a pretend store
 * (makeStore below), so running them never touches the real save in this browser.
 */
export interface SaveCheck {
  name: string;
  ok: boolean;
  /** What went wrong (empty when ok). */
  detail: string;
}

/** A pretend localStorage: just a Map. */
function makeStore(start: Record<string, string> = {}): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(start));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

/** Run one check: `test` throws (with a message) when something is wrong. */
function check(name: string, test: () => void): SaveCheck {
  try {
    test();
    return { name, ok: true, detail: '' };
  } catch (e) {
    return { name, ok: false, detail: (e as Error).message };
  }
}

function expect(ok: boolean, message: string): void {
  if (!ok) throw new Error(message);
}

/** Same data, whatever order the keys are in? */
const same = (a: unknown, b: unknown) => sorted(a) === sorted(b);

/** JSON text with every object's keys in A-Z order. */
function sorted(v: unknown): string {
  return JSON.stringify(v, (_key, value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1)))
      : value,
  );
}

const SPOT = { map: 'cave-3', x: 16.5, y: 4.5, facing: 'up' };

export function runSaveChecks(): SaveCheck[] {
  return [
    check('v1 save upgrades to v5 (glasses kept, nothing found yet)', () => {
      const s = migrate({ version: 1, lastGlasses: 4 });
      expect(!!s && s.version === 5, 'did not become a v5 save');
      expect(s!.lastGlasses === 4, 'lost lastGlasses');
      expect(same(s!.collection, {}) && same(s!.players, {}) && s!.lastWorld === null, 'should start with nothing found and no world');
    }),

    check('v2 save upgrades: found counts become the collection', () => {
      const s = migrate({ version: 2, lastGlasses: 1, muted: true, found: { hopsy: 3, zipzap: 1 } });
      expect(!!s, 'was not read');
      expect(same(s!.collection, { hopsy: { count: 3, firstFound: null }, zipzap: { count: 1, firstFound: null } }), 'collection is wrong');
      expect(s!.muted, 'lost muted');
    }),

    check('v4 → v5: the island spot moves to players.island, finds and settings kept', () => {
      const s = migrate({
        version: 4, lastGlasses: 2, muted: false, player: SPOT, tutorialSeen: true,
        collection: { hopsy: { count: 2, firstFound: '2026-11-01T10:00:00.000Z' } },
      });
      expect(!!s, 'was not read');
      expect(same(s!.players, { island: SPOT }), `players should be { island: spot }, got ${JSON.stringify(s!.players)}`);
      expect(s!.lastWorld === 'island', 'lastWorld should be island');
      expect(s!.collection.hopsy?.count === 2 && s!.collection.hopsy.firstFound === '2026-11-01T10:00:00.000Z', 'lost a find');
      expect(s!.tutorialSeen, 'lost tutorialSeen');
      expect(!('player' in s!), 'the old player field is still there');
    }),

    check('v3 save upgrades all the way (a player who already played skips the how-to-play)', () => {
      const s = migrate({ version: 3, lastGlasses: null, muted: false, player: SPOT, collection: {} });
      expect(!!s && s.tutorialSeen && s.lastWorld === 'island', 'v3 → v5 went wrong');
    }),

    check('Damaged save (not even JSON): backed up, new game, no crash', () => {
      const store = makeStore({ [SAVE_KEY]: '{"version": 5, "collec' });
      const result = loadSave(store);
      expect(result.recovered, 'should say it recovered');
      expect(same(result.data.collection, {}), 'should be a new game');
      const backup = JSON.parse(store.data.get(BACKUP_KEY) ?? 'null');
      expect(backup?.reason === 'damaged' && backup.text === '{"version": 5, "collec', 'the backup should hold the exact broken text');
    }),

    check('Save from a future version: backed up, new game', () => {
      const store = makeStore({ [SAVE_KEY]: JSON.stringify({ version: 99, collection: { hopsy: { count: 1 } } }) });
      const result = loadSave(store);
      expect(result.recovered && store.data.has(BACKUP_KEY), 'should be backed up and replaced');
    }),

    check('Small problems inside a good save are cleaned up quietly', () => {
      const s = migrate({
        version: 5, lastGlasses: 'blue', muted: 'yes', tutorialSeen: true, lastWorld: 'home',
        players: { home: { map: 'home/main', x: Number.NaN, y: 3 }, island: { map: 'overworld', x: 5, y: 6, facing: 'sideways' } },
        collection: { hopsy: { count: -2 }, zipzap: { count: 2.7, firstFound: 'not a date' }, cuppip: 'lots' },
      });
      expect(!!s, 'the whole save was thrown away');
      expect(s!.lastGlasses === null && s!.muted === false, 'bad settings should fall back to defaults');
      expect(!s!.players.home, 'a spot with a broken x should be dropped');
      expect(s!.players.island?.facing === 'down', 'a bad facing should become "down"');
      expect(same(s!.collection, { zipzap: { count: 2, firstFound: null } }), `collection should keep only zipzap, got ${JSON.stringify(s!.collection)}`);
    }),

    check('A save that mentions an unknown world: that spot is dropped, everything else kept', () => {
      const s = migrate({
        version: 5, lastGlasses: 1, muted: false, tutorialSeen: true, lastWorld: 'farm',
        players: { farm: { map: 'farm/barn', x: 3, y: 4, facing: 'up' }, island: SPOT },
        collection: { hopsy: { count: 1, firstFound: null }, 'farm-moocow': { count: 1, firstFound: null } },
      });
      expect(!!s, 'the whole save was thrown away');
      expect(same(Object.keys(s!.players), ['island']), 'only the island spot should stay');
      expect(s!.lastWorld === null, 'an unknown last world should become null (PLAY then opens the world picker)');
      // Finds from a world this copy of the game doesn't have yet are kept, so nothing is lost if it arrives later.
      expect(!!s!.collection['farm-moocow'] && !!s!.collection.hopsy, 'finds should all be kept');
    }),

    check('Export → import with progress in several worlds gives back the same save', () => {
      const save: SaveData = {
        version: 5, lastGlasses: 7, muted: true, tutorialSeen: true, lastWorld: 'wonderwhirl',
        players: {
          island: { map: 'overworld', x: 100.5, y: 80.5, facing: 'left' },
          home: { map: 'home/attic', x: 10.5, y: 6.5, facing: 'up' },
          wonderwhirl: { map: 'wonderwhirl/funhouse', x: 15.5, y: 18.5, facing: 'down' },
        },
        collection: {
          hopsy: { count: 3, firstFound: '2026-11-05T14:52:55.400Z' },
          cuppip: { count: 1, firstFound: '2026-11-06T09:00:00.000Z' },
          stubbit: { count: 2, firstFound: '2026-11-09T20:10:00.000Z' },
        },
      };
      const back = readSaveFile(saveFileText(save));
      expect(same(back, save), `came back different: ${JSON.stringify(back)}`);
    }),

    check('Import also takes a bare save (without the file wrapper)', () => {
      expect(!!readSaveFile(JSON.stringify({ version: 4, lastGlasses: 1, player: null, collection: {} })), 'was not read');
    }),

    check('Import refuses files that are not a save (and changes nothing)', () => {
      for (const text of ['', 'hello', '[1,2,3]', '{"game":"something else","save":{"version":"5"}}', 'null']) {
        expect(readSaveFile(text) === null, `accepted ${JSON.stringify(text)}`);
      }
    }),
  ];
}
