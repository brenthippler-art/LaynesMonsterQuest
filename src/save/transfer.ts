import { migrate, type SaveData } from './save';

/**
 * Moving progress between devices by hand: download a .json file on one,
 * load it on the other. Nothing goes over the internet.
 */
const GAME = "Layne's Monster Quest";

/** The text of a save file (what "Download save file" puts in the .json). */
export function saveFileText(data: SaveData): string {
  const file = { game: GAME, exportedAt: new Date().toISOString(), save: data };
  return JSON.stringify(file, null, 2);
}

/** Make a save file and hand it to the browser as a download. */
export function downloadSave(data: SaveData): void {
  // Today's date where you are (toISOString would use UTC, which can be "tomorrow" in the evening).
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  downloadText(saveFileText(data), `laynes-monster-quest-save-${date}.json`);
}

/** Download any text as a file (also used for the damaged-save backup). */
export function downloadText(text: string, filename: string): void {
  // A blob: link lives only inside this page; clicking it saves the file locally.
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Read a save file. Accepts our download format or a bare save object.
 * Returns null if it isn't a save we understand (nothing is changed then).
 */
export function readSaveFile(text: string): SaveData | null {
  try {
    const parsed: unknown = JSON.parse(text);
    const inner = parsed && typeof parsed === 'object' && 'save' in parsed ? (parsed as { save: unknown }).save : parsed;
    return migrate(inner);
  } catch {
    return null;
  }
}
