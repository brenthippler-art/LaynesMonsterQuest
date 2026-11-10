import './book.css';
import { sfx } from '../audio/sfx';
import { type Monster } from '../monsters/monsterTypes';
import { MONSTER_BY_ID, monstersIn, monstersOf } from '../monsters/worlds';
import { monsterSprite, monsterSvg } from '../monsters/pixel/monsterSprite';
import { pixelsToSvg } from '../monsters/pixel/paint';
import { typeIconSvg } from '../monsters/typeIcons';
import { preparePrint, printColoringPages } from '../print/printer';
import { type SaveData } from '../save/save';
import { realmIconSvg, worldSceneSvg } from '../ui/pixelIcon';
import { realmOf, WORLD_LIST, WORLDS } from '../worlds';
import { type WorldDef } from '../worlds/types';
import { isWorldId } from '../worlds/worldIds';

/**
 * The Monster Book: one world's monsters, grouped by realm. Found ones in color,
 * the rest as dark silhouettes with a "?". Tap a found one to see its page.
 * It opens on the world Layne is in; the tabs at the top (one picture per world)
 * show any other world's page. Totals count only the world being shown.
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
  /** The world whose page is showing. */
  private world: WorldDef;
  /** Draws a slot's picture when it scrolls into view (so opening the book is instant, even with hundreds of slots). */
  private watcher: IntersectionObserver;
  /** Finished slot pictures ("id:known" or "id:mystery" → SVG), kept for the whole visit. */
  private art = new Map<string, string>();
  isOpen = false;

  constructor(
    parent: HTMLElement,
    private save: SaveData,
    /** The world Layne is in right now (the book opens there). */
    private currentWorld: () => WorldDef,
  ) {
    this.world = currentWorld();
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

    this.watcher = new IntersectionObserver((seen) => this.onSlotsVisible(seen), { root: this.body, rootMargin: '200px 0px' });
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
    const here = this.currentWorld();
    if (here !== this.world) this.gridScroll = 0;
    this.world = here;
    this.showGrid();
  }

  close(): void {
    sfx.click();
    this.watcher.disconnect();
    this.isOpen = false;
    this.root.hidden = true;
  }

  private found(m: Monster) {
    return this.save.collection[m.id];
  }

  private onClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('.book__close')) return this.close();
    const tab = target.closest<HTMLElement>('.book__tab');
    if (tab) {
      const id = tab.dataset.world;
      if (isWorldId(id) && WORLDS[id] !== this.world) {
        sfx.click();
        this.world = WORLDS[id];
        this.gridScroll = 0;
        this.showGrid();
      }
      return;
    }
    if (target.closest('.book__back')) {
      sfx.click();
      return this.showGrid();
    }
    const printButton = target.closest<HTMLButtonElement>('.book__print');
    if (printButton) {
      // Right inside the tap, so tablet browsers allow the print dialog to open.
      sfx.click();
      printColoringPages([MONSTER_BY_ID.get(printButton.dataset.id!)!]);
      return;
    }
    const slot = target.closest<HTMLElement>('.slot');
    if (!slot) return;
    const m = MONSTER_BY_ID.get(slot.dataset.id!)!;
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
    const percent = total ? Math.round((foundCount / total) * 100) : 0;
    const tabs = WORLD_LIST.map((w) => {
      const on = w === this.world;
      return `<button class="book__tab${on ? ' on' : ''}" data-world="${w.id}" aria-label="${esc(w.name)}" aria-pressed="${on}">${worldSceneSvg(w)}</button>`;
    }).join('');

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
      <nav class="book__tabs" aria-label="Worlds">${tabs}</nav>
      <div class="book__progress" aria-label="${foundCount} of ${total} found">
        ${STAR}
        <div class="book__bar"><div style="width:${percent}%"></div></div>
        <b>${foundCount} / ${total}</b>
      </div>
      ${sections}`;
    this.body.scrollTop = this.gridScroll;
    // Only slots on (or near) the screen get their pictures; the rest wait until you scroll to them.
    this.watcher.disconnect();
    for (const slot of this.body.querySelectorAll('.slot')) this.watcher.observe(slot);
  }

  private onSlotsVisible(seen: IntersectionObserverEntry[]): void {
    for (const entry of seen) {
      if (!entry.isIntersecting) continue;
      this.watcher.unobserve(entry.target);
      void this.drawSlot(entry.target as HTMLElement);
    }
  }

  /** One slot's picture: in color if found, a dark silhouette if not. Made once, then reused. */
  private async drawSlot(slot: HTMLElement): Promise<void> {
    const m = MONSTER_BY_ID.get(slot.dataset.id!);
    if (!m) return;
    const known = !!this.found(m);
    const key = `${m.id}:${known ? 'known' : 'mystery'}`;
    let svg = this.art.get(key);
    if (!svg) {
      const sprite = await monsterSprite(m, 'small');
      const pixels = known ? sprite.color : sprite.color.map((c) => (c ? SILHOUETTE : null));
      svg = pixelsToSvg(pixels, sprite.width, sprite.height, known ? m.name : 'Mystery monster');
      this.art.set(key, svg);
    }
    const target = slot.querySelector('.slot__art');
    if (target && slot.isConnected) target.innerHTML = svg;
  }

  // ---------- One monster's page ----------

  private showPage(m: Monster): void {
    this.watcher.disconnect(); // the grid's slots are gone
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
