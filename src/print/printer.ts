import './print.css';
import { type Monster } from '../monsters/monsterTypes';
import { monsterSprite, type MonsterSprite } from '../monsters/pixel/monsterSprite';
import { buildColoringPage } from './coloringPage';

/**
 * Printing coloring pages.
 *
 * Tablet browsers (iPad Safari especially) may refuse to open the print dialog
 * unless it happens right away in a tap. So it works in two steps:
 *   1. preparePrint() builds the line art ahead of time (can take a moment)
 *   2. printColoringPages() builds the pages and calls window.print() instantly
 *
 * The pages live in a hidden #print-root that only shows when printing
 * (see print.css). Nothing in the game changes, so play carries on afterwards.
 */
const ready = new Map<string, MonsterSprite>();

export async function preparePrint(monsters: Monster[]): Promise<void> {
  for (const m of monsters) {
    if (!ready.has(m.id)) ready.set(m.id, await monsterSprite(m, 'large'));
  }
}

export function isPrintReady(monsters: Monster[]): boolean {
  return monsters.every((m) => ready.has(m.id));
}

function removePages(): void {
  document.getElementById('print-root')?.remove();
}

/** Print one page per monster. Call preparePrint() first (it returns false if something wasn't ready). */
export function printColoringPages(monsters: Monster[]): boolean {
  if (!monsters.length || !isPrintReady(monsters)) return false;
  removePages();
  const root = document.createElement('div');
  root.id = 'print-root';
  for (const m of monsters) root.append(buildColoringPage(m, ready.get(m.id)!));
  document.body.append(root);
  // Tidy up afterwards (the pages are invisible on screen anyway, so it's fine if this never fires).
  window.addEventListener('afterprint', removePages, { once: true });
  window.print();
  return true;
}
