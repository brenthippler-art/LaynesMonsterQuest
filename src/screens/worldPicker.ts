import './picker.css';
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
  ) {
    this.root = document.createElement('div');
    this.root.className = 'picker';
    this.root.hidden = true;
    this.root.setAttribute('aria-label', 'Worlds');
    this.root.innerHTML = `
      <div class="picker__top"><button class="nes-button picker__back" aria-label="Back">${BACK_ICON}</button></div>
      <div class="picker__cards"></div>`;
    this.cards = this.root.querySelector('.picker__cards')!;
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
    this.cards.innerHTML = WORLD_LIST.map((w) => cardHtml(w, save)).join('');
    this.root.hidden = false;
    const card = this.cardEls().find((c) => c.dataset.world === focusWorld) ?? this.cardEls()[0];
    card?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  hide(): void {
    this.root.hidden = true;
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
function cardHtml(w: WorldDef, save: SaveData): string {
  const p = worldProgress(w, save.collection);
  const realms = w.realms
    .map((r) => `<span class="world-card__realm">${p.realmsDone.has(r.id) ? realmIconSvg(r) : realmSilhouetteSvg(r, NOT_YET)}</span>`)
    .join('');
  return `
    <button class="world-card${p.complete ? ' complete' : ''}" data-world="${w.id}" aria-label="${w.name}: ${p.found} of ${p.total} found">
      ${p.complete ? `<span class="world-card__crown">${CROWN}</span>` : ''}
      <span class="world-card__scene">${worldSceneSvg(w)}</span>
      <span class="world-card__name">${pixelTextSvg([w.name], NES.white)}</span>
      <span class="world-card__realms">${realms}</span>
      <span class="world-card__count">${MONSTER_ICON}${pixelTextSvg([`${p.found}/${p.total}`], NES.gold)}</span>
    </button>`;
}
