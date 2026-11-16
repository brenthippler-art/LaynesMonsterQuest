import './picker.css';
import { type Monster } from '../monsters/monsterTypes';
import { monstersOf } from '../monsters/worlds';
import { NES } from '../render/nesPalette';
import { type SaveData } from '../save/save';
import { gridSvg, realmIconColor, realmIconSvg, realmSilhouetteSvg, worldSceneSvg } from '../ui/pixelIcon';
import { pixelTextSvg } from '../ui/pixelText';
import { WORLD_LIST } from '../worlds';
import { worldProgress } from '../worlds/progress';
import { type WorldDef } from '../worlds/types';
import { isWorldId, type WorldId } from '../worlds/worldIds';

/**
 * The world picker: one big card per world in the registry (a new world shows
 * up here by itself). Each card: the world's picture, its name, 9 realm icons
 * that light up when every monster in that realm is found, and "23/108".
 * A world with everything found wears a gold crown. Every world is always open.
 *
 * Landscape: cards in a row that scrolls sideways. Portrait: stacked, scrolls up/down.
 * Swipe to scroll, tap a card to go. Arrow keys move between cards, Enter goes.
 *
 * On a device that draws 3D, each card's picture also has a 3D monster from that
 * world standing on it (world3d/cardMonsters.ts): one Layne has caught, or a dark
 * mystery shape if he hasn't caught any there yet. The middle card's monster turns and hops.
 */
const BACK_ICON = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="#FCFCFC" stroke-width="3"/></svg>';
const CROWN = gridSvg(
  ['k....k....k', 'Yk..kYk..kY', 'YYkkYYYkkYY', 'YYYYYYYYYYY', 'YrYYYUYYYrY', 'YYYYYYYYYYY', 'OOOOOOOOOOO'],
  realmIconColor,
);
const MONSTER_ICON = gridSvg(
  ['..kkkkk..', '.kPPPPPk.', 'kPwkPwkPk', 'kPPPPPPPk', 'kPPkkkPPk', 'kPPPPPPPk', '.kPkPkPk.', '..k.k.k..'],
  realmIconColor,
);
const NOT_YET = '#2c2c2c';

/** The 3D monsters on the cards (world3d/cardMonsters.ts). */
export interface CardMonsters3D {
  show(cards: { canvas: HTMLCanvasElement; monster: Monster; mystery: boolean }[]): void;
  update(dt: number, middle: HTMLCanvasElement | null): void;
}

export interface PickerActions {
  onPick: (world: WorldId) => void;
  onBack: () => void;
  /** False while something is open on top (grown-ups area, how-to-play) or the screen is changing. */
  canUseKeys: () => boolean;
}

export class WorldPicker {
  private root: HTMLDivElement;
  private cards: HTMLElement;

  constructor(
    parent: HTMLElement,
    private actions: PickerActions,
    /** Leave it out (no 3D on this device) and the cards show just their pictures. */
    private monsters3d?: CardMonsters3D,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'picker';
    this.root.hidden = true;
    this.root.setAttribute('aria-label', 'Worlds');
    
this.root.innerHTML = `
  <div class="picker__top">
    <button class="nes-button picker__back" aria-label="Back">
      ${BACK_ICON}
    </button>
  </div>

  <div class="picker__browser">
    <button
      class="picker__arrow picker__arrow--left"
      aria-label="Previous world"
      type="button"
    >&#10094;</button>

    <div class="picker__cards"></div>

    <button
      class="picker__arrow picker__arrow--right"
      aria-label="Next world"
      type="button"
    >&#10095;</button>
  </div>`;

    this.cards = this.root.querySelector('.picker__cards')!;
    
const leftArrow = this.root.querySelector<HTMLButtonElement>(
  '.picker__arrow--left'
)!;

const rightArrow = this.root.querySelector<HTMLButtonElement>(
  '.picker__arrow--right'
)!;

const scrollToWorld = (direction: number): void => {
  const cards = this.cardEls();
  if (!cards.length) return;

  const center = this.cards.scrollLeft +
    this.cards.clientWidth / 2;

  const current = cards.reduce((best, card, index) => {
    const cardCenter = card.offsetLeft +
      card.offsetWidth / 2;

    const bestCenter = cards[best].offsetLeft +
      cards[best].offsetWidth / 2;

    return Math.abs(cardCenter - center) <
      Math.abs(bestCenter - center)
      ? index
      : best;
  }, 0);

  const next = Math.max(
    0,
    Math.min(cards.length - 1, current + direction)
  );

  cards[next].scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center',
  });
};

leftArrow.addEventListener('click', () => scrollToWorld(-1));
rightArrow.addEventListener('click', () => scrollToWorld(1));

    parent.append(this.root);

    this.root.querySelector('.picker__back')!.addEventListener('click', () => actions.onBack());
    this.cards.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).closest<HTMLElement>('.world-card')?.dataset.world;
      if (isWorldId(id)) actions.onPick(id);
    });
    window.addEventListener('keydown', (e) => this.onKey(e));
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Show fresh cards (progress may have changed). `focusWorld` gets keyboard focus (the last world played). */
  show(save: SaveData, focusWorld: WorldId | null): void {
    this.cards.innerHTML = WORLD_LIST.map((w) => cardHtml(w, save, !!this.monsters3d)).join('');
    this.root.hidden = false;
    this.monsters3d?.show(
      WORLD_LIST.map((w) => {
        const all = monstersOf(w.id);
        const caught = all.filter((m) => save.collection[m.id]);
        const pool = caught.length ? caught : all;
        const canvas = this.cards.querySelector<HTMLCanvasElement>(`[data-world="${w.id}"] .world-card__monster`)!;
        return { canvas, monster: pool[Math.floor(Math.random() * pool.length)], mystery: caught.length === 0 };
      }),
    );
    const card = this.cardEls().find((c) => c.dataset.world === focusWorld) ?? this.cardEls()[0];
    card?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  hide(): void {
    this.root.hidden = true;
  }

  /** Called every frame: the monster on the card in the middle of the screen turns and hops. */
  update(dt: number): void {
    if (this.root.hidden || !this.monsters3d) return;
    const box = this.cards.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    let middle: HTMLElement | null = null;
    let best = Infinity;
    for (const card of this.cardEls()) {
      const r = card.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
      if (d < best) [best, middle] = [d, card];
    }
    this.monsters3d.update(dt, middle?.querySelector<HTMLCanvasElement>('.world-card__monster') ?? null);
  }

  private cardEls(): HTMLElement[] {
    return [...this.cards.querySelectorAll<HTMLElement>('.world-card')];
  }

  /** Arrow keys hop between cards; Escape goes back. (Enter / Space press the focused card like any button.) */
  private onKey(e: KeyboardEvent): void {
    if (this.root.hidden || !this.actions.canUseKeys()) return;
    if (e.code === 'Escape') {
      this.actions.onBack();
      return;
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.code];
    if (!step) return;
    e.preventDefault();
    const cards = this.cardEls();
    const now = cards.indexOf(document.activeElement as HTMLElement);
    const next = cards[Math.max(0, Math.min(cards.length - 1, now + step))];
    next?.focus({ preventScroll: true });
    next?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/** One world's card. */
function cardHtml(w: WorldDef, save: SaveData, monster3d: boolean): string {
  const p = worldProgress(w, save.collection);
  const realms = w.realms
    .map((r) => `<span class="world-card__realm">${p.realmsDone.has(r.id) ? realmIconSvg(r) : realmSilhouetteSvg(r, NOT_YET)}</span>`)
    .join('');
  return `
    <button class="world-card${p.complete ? ' complete' : ''}" data-world="${w.id}" aria-label="${w.name}: ${p.found} of ${p.total} found">
      ${p.complete ? `<span class="world-card__crown">${CROWN}</span>` : ''}
      <span class="world-card__scene">${worldSceneSvg(w)}${monster3d ? '<canvas class="world-card__monster" width="128" height="128" aria-hidden="true"></canvas>' : ''}</span>
      <span class="world-card__name">${pixelTextSvg([w.name], NES.white)}</span>
      <span class="world-card__realms">${realms}</span>
      <span class="world-card__count">${MONSTER_ICON}${pixelTextSvg([`${p.found}/${p.total}`], NES.gold)}</span>
    </button>`;
}
