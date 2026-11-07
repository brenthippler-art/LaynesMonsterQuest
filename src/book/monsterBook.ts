import './book.css';
import { sfx } from '../audio/sfx';
import { type Monster } from '../monsters/monsterTypes';
import { MONSTERS, monstersIn, monstersOf } from '../monsters/worlds';
import { monsterSprite, monsterSvg } from '../monsters/pixel/monsterSprite';
import { pixelsToSvg } from '../monsters/pixel/paint';
import { typeIconSvg } from '../monsters/typeIcons';
import { preparePrint, printColoringPages } from '../print/printer';
import { type SaveData } from '../save/save';
import { realmIconSvg } from '../ui/pixelIcon';
import { realmOf } from '../worlds';
import { type WorldDef } from '../worlds/types';

/**
 * The Monster Book: every monster of the CURRENT world, grouped by realm. Found ones in color,
 * the rest as dark silhouettes with a "?". Tap a found one to see its page.
 */
const BOOK_ICON =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M2 3h5l1 1 1-1h5v10H9l-1 1-1-1H2z" fill="#F83800" stroke="#FCFCFC"/><path d="M8 4v9" stroke="#FCFCFC"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="#FCFCFC" stroke-width="3"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="#FCFCFC" stroke-width="3"/></svg>';
const STAR = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M8 1l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z" fill="#F8B800" stroke="#000"/></svg>';
const PRINTER_ICON =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 1h8v4H4z" fill="#FCFCFC"/><path d="M1 5h14v7h-3v-2H4v2H1z" fill="#BCBCBC"/><path d="M4 10h8v5H4z" fill="#FCFCFC"/><path d="M5 12h6M5 14h4" stroke="#000"/><rect x="12" y="6" width="2" height="1" fill="#00A800"/></svg>';
const SILHOUETTE = '#1c1c1c';

function esc(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
}

export class MonsterBook {
  private root: HTMLDivElement;
  private body: HTMLElement;
  private gridScroll = 0;
  isOpen = false;

  constructor(
    parent: HTMLElement,
    private save: SaveData,
    /** The world Layne is in: the book shows its realms and monsters. */
    private world: WorldDef,
  ) {
    const button = document.createElement('button');
    button.className = 'book-button nes-box';
    button.setAttribute('aria-label', 'Monster Book');
    button.innerHTML = BOOK_ICON;
    button.addEventListener('click', () => this.open());
    parent.append(button);

    this.root = document.createElement('div');
    this.root.className = 'book';
    this.root.hidden = true;
    this.root.innerHTML = `<div class="book__box nes-box" role="dialog" aria-modal="true" aria-label="Monster Book"><div class="book__body"></div></div>`;
    this.body = this.root.querySelector('.book__body')!;
    parent.append(this.root);

    this.root.addEventListener('click', (e) => this.onClick(e));
    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.code === 'Escape') this.close();
    });
  }

  open(): void {
    sfx.unlock();
    sfx.click();
    this.isOpen = true;
    this.root.hidden = false;
    this.showGrid();
  }

  close(): void {
    sfx.click();
    this.isOpen = false;
    this.root.hidden = true;
  }

  private found(m: Monster) {
    return this.save.collection[m.id];
  }

  private onClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('.book__close')) return this.close();
    if (target.closest('.book__back')) {
      sfx.click();
      return this.showGrid();
    }
    const printButton = target.closest<HTMLButtonElement>('.book__print');
    if (printButton) {
      // Right inside the tap, so tablet browsers allow the print dialog to open.
      sfx.click();
      printColoringPages([MONSTERS.find((x) => x.id === printButton.dataset.id)!]);
      return;
    }
    const slot = target.closest<HTMLElement>('.slot');
    if (!slot) return;
    const m = MONSTERS.find((x) => x.id === slot.dataset.id)!;
    if (this.found(m)) {
      sfx.click();
      this.gridScroll = this.body.scrollTop;
      this.showPage(m);
    } else {
      // Not found yet: a little wiggle, no info (that's the fun of finding it!)
      slot.classList.remove('wiggle');
      void slot.offsetWidth;
      slot.classList.add('wiggle');
    }
  }

  // ---------- The grid of all monsters ----------

  private showGrid(): void {
    const all = monstersOf(this.world.id);
    const total = all.length;
    const foundCount = all.filter((m) => this.found(m)).length;
    const percent = Math.round((foundCount / total) * 100);

    const sections = this.world.realms.map((r) => {
      const list = monstersIn(this.world.id, r.id);
      const here = list.filter((m) => this.found(m)).length;
      const slots = list
        .map((m) => {
          const known = !!this.found(m);
          return `<button class="slot ${known ? 'known' : 'unknown'}${m.rarity === 'rare' ? ' rare' : ''}" data-id="${m.id}" aria-label="${known ? esc(m.name) : 'Not found yet'}">
              <span class="slot__art"></span>
              <span class="slot__name">${known ? esc(m.name) : '?'}</span>
            </button>`;
        })
        .join('');
      return `<section class="book__habitat">
          <h3><span class="hab-icon">${realmIconSvg(r)}</span>${r.label}<small>${here} / ${list.length}</small></h3>
          <div class="book__grid">${slots}</div>
        </section>`;
    }).join('');

    this.body.innerHTML = `
      <header class="book__header">
        <h2>Monster Book</h2>
        <button class="nes-button book__close" aria-label="Close">${CLOSE_ICON}</button>
      </header>
      <div class="book__progress" aria-label="${foundCount} of ${total} found">
        ${STAR}
        <div class="book__bar"><div style="width:${percent}%"></div></div>
        <b>${foundCount} / ${total}</b>
      </div>
      ${sections}`;
    this.body.scrollTop = this.gridScroll;
    void this.fillArt();
  }

  /** Pictures take a moment to build, so fill them in one by one (they're cached after the first time). */
  private async fillArt(): Promise<void> {
    for (const m of monstersOf(this.world.id)) {
      const sprite = await monsterSprite(m, 'small');
      const slot = this.body.querySelector<HTMLElement>(`.slot[data-id="${m.id}"] .slot__art`);
      if (!slot) return; // the book was closed or changed page
      const known = !!this.found(m);
      const pixels = known ? sprite.color : sprite.color.map((c) => (c ? SILHOUETTE : null));
      slot.innerHTML = pixelsToSvg(pixels, sprite.width, sprite.height, known ? m.name : 'Mystery monster');
    }
  }

  // ---------- One monster's page ----------

  private showPage(m: Monster): void {
    const rec = this.found(m)!;
    const realm = realmOf(m);
    const first = rec.firstFound
      ? new Date(rec.firstFound).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : null;

    this.body.innerHTML = `
      <header class="book__header">
        <button class="nes-button book__back" aria-label="Back to the book">${BACK_ICON}</button>
        <h2>${esc(m.name)}${m.rarity === 'rare' ? ' <span class="rare-tag">★</span>' : ''}</h2>
        <button class="nes-button book__close" aria-label="Close">${CLOSE_ICON}</button>
      </header>
      <div class="page">
        <div class="page__art"></div>
        <div class="page__facts">
          <p class="page__chips">
            <span class="chip">${typeIconSvg(m.type, 28)} ${m.type}</span>
            ${realm ? `<span class="chip"><span class="hab-icon">${realmIconSvg(realm)}</span> ${realm.label}</span>` : ''}
          </p>
          <p class="page__found">${STAR} Found ${rec.count} ${rec.count === 1 ? 'time' : 'times'}</p>
          <p><b>${esc(m.ability.name)}:</b> ${esc(m.ability.description)}</p>
          <p class="page__fact">${esc(m.fact)}</p>
          ${first ? `<p class="page__date">First found: ${first}</p>` : ''}
          <button class="nes-button book__print" data-id="${m.id}" disabled>${PRINTER_ICON}<span>Print Coloring Page</span></button>
        </div>
      </div>`;
    this.body.scrollTop = 0;
    // Get the line art ready now, so pressing Print can open the print dialog instantly.
    void preparePrint([m]).then(() => {
      const button = this.body.querySelector<HTMLButtonElement>(`.book__print[data-id="${m.id}"]`);
      if (button) button.disabled = false;
    });
    void monsterSvg(m, 'color').then((svg) => {
      const art = this.body.querySelector('.page__art');
      if (art) art.innerHTML = svg;
    });
  }
}
