import './title.css';
import { type Monster } from '../monsters/monsterTypes';
import { monsterSprite } from '../monsters/pixel/monsterSprite';
import { pixelsToSvg } from '../monsters/pixel/paint';
import { MONSTERS, monstersOf } from '../monsters/worlds';
import { type GlassesStyle } from '../player/glasses';
import { NES } from '../render/nesPalette';
import { drawLayne } from '../render/playerArt';
import { type SaveData } from '../save/save';
import { gridSvg } from '../ui/pixelIcon';
import { pixelTextSvg } from '../ui/pixelText';

/**
 * The title screen: the game's name in big pixel letters, Layne walking in
 * place with a few of his monster friends hopping around him, one huge PLAY
 * button and a WORLDS (globe) button. Everything is drawn in code.
 */
const PLAY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="#FCFCFC"/></svg>';
const GLOBE = gridSvg(
  [
    '.....kkkkkk.....',
    '...kkuuuuuukk...',
    '..kuggguuuggguk.',
    '.kugggguuuugggk.',
    '.kuuggguuugggguk',
    'kuuuuguuuuuggguk',
    'kuguuuuuuuuuguuk',
    'kggguuuuuuuuuuuk',
    'kgggguuuuuggguuk',
    'kugggguuuggggguk',
    'kuuggguuuugggguk',
    '.kuuguuuuuuggguk',
    '.kuuuuuuuuuugguk',
    '..kuuuuuuuuuuuk.',
    '...kkuuuuuuukk..',
    '.....kkkkkk.....',
  ],
  (ch) => ({ k: NES.black, u: NES.sky, g: NES.green })[ch],
);
const SILHOUETTE = '#1c1c1c';
const HOPPERS = 4;

export interface TitleActions {
  onPlay: () => void;
  onWorlds: () => void;
}

export class TitleScreen {
  private root: HTMLDivElement;
  private layne: HTMLCanvasElement;
  private friends: HTMLElement[];
  private play: HTMLButtonElement;
  private time = 0;
  /** Counts show() calls, so a slow picture from an earlier visit can't land on a newer one. */
  private showing = 0;

  constructor(
    parent: HTMLElement,
    private glasses: GlassesStyle,
    actions: TitleActions,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'title';
    this.root.hidden = true;
    this.root.innerHTML = `
      <h1 class="title__name" aria-label="Layne's Monster Quest">${pixelTextSvg(["LAYNE'S", 'MONSTER QUEST'], NES.gold, NES.brownRed)}</h1>
      <div class="title__stage">
        ${'<div class="title__friend"></div>'.repeat(HOPPERS)}
        <canvas class="title__layne" width="80" height="104"></canvas>
      </div>
      <div class="title__buttons">
        <button class="nes-button title__worlds" aria-label="Worlds">${GLOBE}</button>
        <button class="nes-button title__play" aria-label="Play">${PLAY_ICON}</button>
      </div>`;
    parent.append(this.root);
    this.layne = this.root.querySelector('.title__layne')!;
    this.friends = [...this.root.querySelectorAll<HTMLElement>('.title__friend')];
    this.play = this.root.querySelector('.title__play')!;
    this.play.addEventListener('click', actions.onPlay);
    this.root.querySelector('.title__worlds')!.addEventListener('click', actions.onWorlds);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  show(save: SaveData): void {
    this.root.hidden = false;
    void this.pickFriends(save);
    this.focus();
  }

  /** Put keyboard focus on PLAY, so Enter / Space start the game straight away. */
  focus(): void {
    if (!this.root.hidden) this.play.focus({ preventScroll: true });
  }

  hide(): void {
    this.root.hidden = true;
  }

  /** Called every frame: Layne walks in place. */
  update(dt: number): void {
    if (this.root.hidden) return;
    this.time += dt;
    const ctx = this.layne.getContext('2d')!;
    ctx.clearRect(0, 0, this.layne.width, this.layne.height);
    drawLayne(ctx, this.layne.width / 2, this.layne.height, 4, 'down', Math.floor(this.time * 6) % 4, this.glasses);
  }

  /** 3 or 4 random monsters he's caught (from any world). None yet? Mystery silhouettes of island monsters. */
  private async pickFriends(save: SaveData): Promise<void> {
    const caught = MONSTERS.filter((m) => save.collection[m.id]);
    const mystery = caught.length === 0;
    const pool = shuffle(mystery ? monstersOf('island') : caught);
    const count = Math.min(pool.length, mystery ? HOPPERS : 3 + Math.floor(Math.random() * 2));
    const chosen: (Monster | undefined)[] = pool.slice(0, count);
    const visit = ++this.showing;
    for (const [i, el] of this.friends.entries()) {
      const m = chosen[i];
      el.hidden = !m;
      el.innerHTML = '';
      if (!m) continue;
      const s = await monsterSprite(m, 'small');
      if (visit !== this.showing) return;
      const pixels = mystery ? s.color.map((c) => (c ? SILHOUETTE : null)) : s.color;
      el.innerHTML = pixelsToSvg(pixels, s.width, s.height, mystery ? 'Mystery monster' : m.name);
    }
  }
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
