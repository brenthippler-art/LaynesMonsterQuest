import { isWorldId, type WorldId } from '../worlds/worldIds';

/**
 * Everything the game remembers between visits, stored in ONE localStorage key.
 * When the shape of the data changes, bump the version and add an upgrade
 * step to migrate(), so nobody ever loses progress.
 *
 * History:
 *   v1 { lastGlasses }
 *   v2 + found (id → times found), muted
 *   v3 + player (map, position, facing); found → collection (count + first-found date)
 *   v4 + tutorialSeen (has the how-to-play been shown?)
 *   v5 player → players (one spot per world id, the island's spot moves to players.island)
 *      + lastWorld (the world Layne was in last). collection stays one list: ids are unique across worlds.
 *
 * If the save is damaged (or from a future version we don't understand), we
 * NEVER crash: a copy goes to a backup key and the game starts fresh.
 */
export const SAVE_KEY = 'lmq-save-v1';
/** Holds a copy of the most recent save we couldn't read (or the save from just before a reset). */
export const BACKUP_KEY = 'lmq-save-v1-backup';

/**
 * Where saves are kept: the browser's localStorage, unless another store is passed in.
 * (The save checks on /gallery pass a pretend store, so testing never touches the real save.)
 */
export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

export type Facing = 'down' | 'up' | 'left' | 'right';
const FACINGS: Facing[] = ['down', 'up', 'left', 'right'];

export interface FoundRecord {
  count: number;
  /** When this monster was first found (ISO date), or null if unknown (found before v3). */
  firstFound: string | null;
}

export interface PlayerSpot {
  /** A map id of that world: 'overworld' or 'cave-3' on the island, '<worldId>/<map>' in newer worlds. */
  map: string;
  x: number;
  y: number;
  facing: Facing;
}

export interface SaveData {
  version: 5;
  /** Which glasses style Layne wore last visit, so we can pick a different one. */
  lastGlasses: number | null;
  /** Sound off? */
  muted: boolean;
  /** Where Layne is in each world he's visited (a missing world = start at its beginning). */
  players: Partial<Record<WorldId, PlayerSpot>>;
  /** The world he was in last time (null = brand-new game). */
  lastWorld: WorldId | null;
  /** Monster id → how many times found + when first found. */
  collection: Record<string, FoundRecord>;
  /** Has the picture "how to play" been shown? (Only on the very first visit.) */
  tutorialSeen: boolean;
}

export function freshSave(): SaveData {
  return { version: 5, lastGlasses: null, muted: false, players: {}, lastWorld: null, collection: {}, tutorialSeen: false };
}

// ---------- Reading untrusted data safely ----------

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const isDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

function cleanPlayer(v: unknown): PlayerSpot | null {
  if (!v || typeof v !== 'object') return null;
  const p = v as Record<string, unknown>;
  const x = num(p.x);
  const y = num(p.y);
  if (typeof p.map !== 'string' || x === null || y === null) return null;
  const facing = FACINGS.includes(p.facing as Facing) ? (p.facing as Facing) : 'down';
  return { map: p.map, x, y, facing };
}

/** Keep only spots for worlds we know about (an unknown world id is just dropped). */
function cleanPlayers(v: unknown): Partial<Record<WorldId, PlayerSpot>> {
  const out: Partial<Record<WorldId, PlayerSpot>> = {};
  if (!v || typeof v !== 'object' || Array.isArray(v)) return out;
  for (const [world, spot] of Object.entries(v)) {
    const clean = cleanPlayer(spot);
    if (isWorldId(world) && clean) out[world] = clean;
  }
  return out;
}

function cleanCollection(v: unknown): Record<string, FoundRecord> {
  const out: Record<string, FoundRecord> = {};
  if (!v || typeof v !== 'object') return out;
  for (const [id, rec] of Object.entries(v)) {
    if (!rec || typeof rec !== 'object') continue;
    const r = rec as Record<string, unknown>;
    const count = num(r.count);
    if (count === null || count < 1) continue;
    out[id] = { count: Math.floor(count), firstFound: isDate(r.firstFound) ? r.firstFound : null };
  }
  return out;
}

/** v2 stored just a number per monster; v3 adds the date (unknown for old finds). */
function foundToCollection(v: unknown): Record<string, FoundRecord> {
  const out: Record<string, FoundRecord> = {};
  if (!v || typeof v !== 'object') return out;
  for (const [id, count] of Object.entries(v)) {
    const c = num(count);
    if (c !== null && c >= 1) out[id] = { count: Math.floor(c), firstFound: null };
  }
  return out;
}

/**
 * Turn stored data into a valid current save, upgrading old versions step by step.
 * Returns null if it isn't a save we understand (then the caller backs it up).
 * Small problems inside a good save (a weird count, a bad date) are just cleaned up.
 */
export function migrate(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  let d = raw as Record<string, unknown>;

  if (d.version === 1) d = { version: 2, lastGlasses: d.lastGlasses, found: {}, muted: false };
  if (d.version === 2) d = { version: 3, lastGlasses: d.lastGlasses, muted: d.muted, player: null, collection: foundToCollection(d.found) };
  if (d.version === 3) {
    // Someone who already played doesn't need the how-to-play.
    const played = d.player != null || Object.keys(cleanCollection(d.collection)).length > 0;
    d = { ...d, version: 4, tutorialSeen: played };
  }
  if (d.version === 4) {
    // Before v5 there was only the island.
    const spot = cleanPlayer(d.player);
    d = { ...d, version: 5, player: undefined, players: spot ? { island: spot } : {}, lastWorld: spot ? 'island' : null };
  }
  if (d.version !== 5) return null; // unknown or future version

  const players = cleanPlayers(d.players);
  return {
    version: 5,
    lastGlasses: num(d.lastGlasses),
    muted: d.muted === true,
    players,
    // A last world we don't know (or have no spot for) just means "start in the default world".
    lastWorld: isWorldId(d.lastWorld) ? d.lastWorld : null,
    collection: cleanCollection(d.collection),
    tutorialSeen: d.tutorialSeen === true,
  };
}

// ---------- localStorage (which can be blocked, full, or fail: never let that crash the game) ----------

export interface LoadResult {
  data: SaveData;
  /** True if a damaged save was found, backed up, and replaced with a new game. */
  recovered: boolean;
}

export function loadSave(store?: KeyValueStore): LoadResult {
  let text: string | null;
  try {
    text = (store ?? localStorage).getItem(SAVE_KEY);
  } catch {
    return { data: freshSave(), recovered: false }; // storage blocked: play without saving
  }
  if (text === null) return { data: freshSave(), recovered: false };

  let data: SaveData | null = null;
  try {
    data = migrate(JSON.parse(text));
  } catch {
    data = null; // not even valid JSON
  }
  if (data) return { data, recovered: false };

  backupSave(text, 'damaged', store);
  return { data: freshSave(), recovered: true };
}

export function writeSave(data: SaveData): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false; // can't save right now; the game still works
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // nothing to do
  }
}

export interface Backup {
  reason: 'damaged' | 'before-reset' | 'before-import';
  savedAt: string;
  /** The exact text that was in storage. */
  text: string;
}

export function backupSave(text: string, reason: Backup['reason'], store?: KeyValueStore): void {
  try {
    const backup: Backup = { reason, savedAt: new Date().toISOString(), text };
    (store ?? localStorage).setItem(BACKUP_KEY, JSON.stringify(backup));
  } catch {
    // storage full or blocked: nothing more we can do
  }
}

export function readBackup(): Backup | null {
  try {
    const b = JSON.parse(localStorage.getItem(BACKUP_KEY) ?? 'null');
    return b && typeof b.text === 'string' && isDate(b.savedAt) ? (b as Backup) : null;
  } catch {
    return null;
  }
}

/** The raw text currently stored (for backing up before a reset/import). */
export function currentSaveText(): string | null {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
}

/** Count one more find (catching one you already have still counts). Returns the updated record. */
export function recordFound(data: SaveData, monsterId: string): FoundRecord {
  const rec = (data.collection[monsterId] ??= { count: 0, firstFound: new Date().toISOString() });
  rec.count++;
  return rec;
}
