import './howToPlay.css';
import { sfx } from '../audio/sfx';
import { drawRing, inZone, RING_CANVAS, ringScale, RULES } from '../encounters/catchRing';
import { MONSTERS } from '../monsters/worlds';
import { monsterSprite, monsterSvg } from '../monsters/pixel/monsterSprite';
import { pixelsToSvg } from '../monsters/pixel/paint';
import { type GlassesStyle } from '../player/glasses';
import { drawLayne } from '../render/playerArt';
import { gridSvg } from '../ui/pixelIcon';

/**
 * "How to play", for a kid who can't read yet: four little animated scenes,
 * no words at all.
 *   1. Tap a spot (or use the arrow keys) and Layne walks there.
 *   2. Walk into a monster to meet it.
 *   3. Tap when the ring is in the green to catch it.
 *   4. Your monsters go in your book.
 * Big ▶ button for the next scene, ✓ to start playing.
 */
const HAND = [
  '....kk......',
  '...kwwk.....',
  '...kwwk.....',
  '...kwwk.....',
  '...kwwkkk...',
  '...kwwkwwkk.',
  '.kkkwwkwwkwk',
  'kwwkwwwwwkwk',
  'kwwwwwwwwwwk',
  '.kwwwwwwwwwk',
  '..kwwwwwwwwk',
  '...kwwwwwwk.',
  '....kwwwwk..',
  '....kkkkkk..',
];
const handSvg = gridSvg(HAND, (ch) => (ch === 'k' ? '#000000' : '#FCFCFC'));
const BRACKETS = gridSvg(
  ['YYY......YYY', 'Y..........Y', 'Y..........Y', '............', '............', '............', '............', '............', '............', 'Y..........Y', 'Y..........Y', 'YYY......YYY'],
  () => '#F8B800',
);
const KEYS =
  '<svg viewBox="0 0 30 20" aria-hidden="true"><g fill="#FCFCFC" stroke="#000"><rect x="10.5" y="0.5" width="9" height="9"/><rect x="0.5" y="10.5" width="9" height="9"/><rect x="10.5" y="10.5" width="9" height="9"/><rect x="20.5" y="10.5" width="9" height="9"/></g>' +
  '<g fill="#000"><path d="M15 2.5l3 4h-6z"/><path d="M2.5 15l4-3v6z"/><path d="M15 17.5l3-4h-6z"/><path d="M27.5 15l-4-3v6z"/></g></svg>';
const BANG = '<svg viewBox="0 0 10 14" aria-hidden="true"><rect x="0.5" y="0.5" width="9" height="13" fill="#FCFCFC" stroke="#000"/><rect x="4" y="2" width="2" height="7" fill="#F83800"/><rect x="4" y="10" width="2" height="2" fill="#F83800"/></svg>';
const STAR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z" fill="#F8B800" stroke="#000"/></svg>';
const BOOK =
  '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M2 3h5l1 1 1-1h5v10H9l-1 1-1-1H2z" fill="#F83800" stroke="#FCFCFC"/><path d="M8 4v9" stroke="#FCFCFC"/></svg>';
const NEXT_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2l7 6-7 6z" fill="#FCFCFC"/></svg>';
const OK_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8l3 3 7-7" fill="none" stroke="#FCFCFC" stroke-width="3"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="#FCFCFC" stroke-width="3"/></svg>';

const SCENES = 4;
const RING_RULES = RULES.common;

export class HowToPlay {
  private root: HTMLDivElement;
  private scenes: HTMLElement[] = [];
  private dots: HTMLElement;
  private nextButton: HTMLButtonElement;
  private laynes: HTMLCanvasElement[] = [];
  private ring!: HTMLCanvasElement;
  private catchScene!: HTMLElement;
  private page = 0;
  private time = 0;
  private ringTime = 0;
  private celebrate = 0;
  isOpen = false;

  constructor(
    parent: HTMLElement,
    private glasses: GlassesStyle,
    private onDone: () => void,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'howto';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="howto__box nes-box" role="dialog" aria-modal="true" aria-label="How to play">
        <button class="nes-button howto__close" aria-label="Close">${CLOSE_ICON}</button>
        <div class="howto__stage">${this.sceneHtml()}</div>
        <div class="howto__bottom">
          <div class="howto__dots">${'<i></i>'.repeat(SCENES)}</div>
          <button class="nes-button howto__next" aria-label="Next">${NEXT_ICON}</button>
        </div>
      </div>`;
    parent.append(this.root);
    this.scenes = [...this.root.querySelectorAll<HTMLElement>('.scene')];
    this.dots = this.root.querySelector('.howto__dots')!;
    this.nextButton = this.root.querySelector('.howto__next')!;
    this.catchScene = this.scenes[2];
    this.ring = this.root.querySelector('.scene__ring')!;
    this.laynes = [...this.root.querySelectorAll<HTMLCanvasElement>('canvas.scene__layne')];
    this.nextButton.addEventListener('click', () => this.next());
    this.root.querySelector('.howto__close')!.addEventListener('click', () => this.close());
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.code === 'Escape') this.close();
      // Space / Enter / → go to the next picture (keyboard players don't need the mouse).
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });
    void this.loadMonsters();
  }

  open(): void {
    this.isOpen = true;
    this.root.hidden = false;
    this.show(0);
  }

  /** Called every frame: walks Layne's legs and runs the little catch game in scene 3. */
  update(dt: number): void {
    if (!this.isOpen) return;
    this.time += dt;
    const frame = Math.floor(this.time * 8) % 4;
    for (const canvas of this.laynes) {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLayne(ctx, canvas.width / 2, canvas.height, 4, 'right', frame, this.glasses);
    }
    if (this.page === 2) this.updateCatch(dt);
  }

  private updateCatch(dt: number): void {
    if (this.celebrate > 0) {
      this.celebrate -= dt;
      if (this.celebrate <= 0) {
        this.catchScene.classList.remove('caught');
        this.ringTime = 0;
      }
      return;
    }
    this.ringTime += dt;
    const scale = ringScale(this.ringTime, RING_RULES);
    drawRing(this.ring, RING_RULES, scale);
    // The pretend hand taps right in the middle of the green zone.
    if (inZone(scale, RING_RULES) && Math.abs(scale - 1) < 0.03) {
      this.catchScene.classList.add('caught');
      this.celebrate = 1.4;
    }
  }

  private next(): void {
    sfx.click();
    if (this.page < SCENES - 1) this.show(this.page + 1);
    else this.close();
  }

  private close(): void {
    this.isOpen = false;
    this.root.hidden = true;
    this.onDone();
  }

  private show(page: number): void {
    this.page = page;
    this.scenes.forEach((s, i) => (s.hidden = i !== page));
    [...this.dots.children].forEach((d, i) => d.classList.toggle('on', i === page));
    const last = page === SCENES - 1;
    this.nextButton.innerHTML = last ? OK_ICON : NEXT_ICON;
    this.nextButton.classList.toggle('howto__go', last);
    this.nextButton.setAttribute('aria-label', last ? 'Play' : 'Next');
    this.ringTime = 0;
    this.celebrate = 0;
    this.catchScene.classList.remove('caught');
  }

  private sceneHtml(): string {
    const layne = '<canvas class="scene__layne" width="80" height="104"></canvas>';
    return `
      <div class="scene scene--move" aria-label="Tap a spot and Layne walks there">
        ${layne}
        <div class="scene__target">${BRACKETS}</div>
        <div class="scene__hand tap">${handSvg}</div>
        <div class="scene__keys">${KEYS}</div>
      </div>
      <div class="scene scene--meet" aria-label="Walk into a monster to meet it" hidden>
        ${layne}
        <div class="scene__monster" data-monster="hopsy"></div>
        <div class="scene__bang">${BANG}</div>
      </div>
      <div class="scene scene--catch" aria-label="Tap when the ring is in the green" hidden>
        <div class="scene__monster big" data-monster="buttercub"></div>
        <canvas class="scene__ring" width="${RING_CANVAS}" height="${RING_CANVAS}"></canvas>
        <div class="scene__hand">${handSvg}</div>
        <div class="scene__stars">${STAR}${STAR}${STAR}</div>
      </div>
      <div class="scene scene--book" aria-label="Your monsters go in your book" hidden>
        <div class="scene__book">${BOOK}</div>
        <div class="scene__slots">
          <div class="scene__slot known" data-monster="hopsy"></div>
          <div class="scene__slot known" data-monster="buttercub"></div>
          <div class="scene__slot unknown" data-silhouette="snowpuff"><b>?</b></div>
        </div>
      </div>`;
  }

  /** Fill in the monster pictures (they take a moment to build). */
  private async loadMonsters(): Promise<void> {
    const find = (id: string) => MONSTERS.find((m) => m.id === id)!;
    for (const el of this.root.querySelectorAll<HTMLElement>('[data-monster]')) {
      el.innerHTML = await monsterSvg(find(el.dataset.monster!), 'color', 'small');
    }
    for (const el of this.root.querySelectorAll<HTMLElement>('[data-silhouette]')) {
      const s = await monsterSprite(find(el.dataset.silhouette!), 'small');
      el.insertAdjacentHTML('afterbegin', pixelsToSvg(s.color.map((c) => (c ? '#1c1c1c' : null)), s.width, s.height, 'Mystery monster'));
    }
  }
}
