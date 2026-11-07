import './encounter.css';
import { sfx } from '../audio/sfx';
import { type Monster } from '../monsters/monsterTypes';
import { monsterSvg } from '../monsters/pixel/monsterSprite';
import { typeIconSvg } from '../monsters/typeIcons';
import { type EncounterBg } from '../worlds/types';
import { type CatchRules, drawRing, inZone, RING_CANVAS, ringScale, RULES } from './catchRing';
import { Confetti } from './confetti';

/**
 * The friendly encounter screen + catch mini-game.
 *
 *   intro  → the monster pops up with its name, type and ability
 *   ring   → a ring shrinks; tap (or Space) when it's in the green zone
 *   almost → a happy "Almost!", then the ring starts again (3 tries)
 *   found  → confetti! "You found Hopsy!"
 *   away   → the monster happily hops off to play (it can be found again)
 *
 * No losing, no scary words: the worst thing that happens is a monster
 * hopping away to play.
 */
export type Outcome = 'found' | 'away' | 'left';
type State = 'closed' | 'intro' | 'ring' | 'almost' | 'found' | 'away';

const TRIES = 3;
const INTRO_SECONDS = 1;
const ALMOST_SECONDS = 0.9;
const AWAY_AUTO_CLOSE = 4;
const RESULT_MIN_SECONDS = 1; // the result screen ignores taps for this long
const RING_START_GRACE = 0.3; // a fresh ring ignores taps for this long (no accidental double-taps)

const STAR = (filled: boolean) =>
  `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M8 1l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z" fill="${filled ? '#F8B800' : 'none'}" stroke="#FCFCFC" stroke-width="1.5"/></svg>`;
const BACK_ICON = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="#FCFCFC" stroke-width="3"/></svg>';
const OK_ICON = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 8l3 3 7-7" fill="none" stroke="#FCFCFC" stroke-width="3"/></svg>';

export class EncounterScreen {
  private root: HTMLDivElement;
  private el: Record<'title' | 'type' | 'monster' | 'ability' | 'tries' | 'message' | 'back' | 'ok', HTMLElement>;
  private ring: HTMLCanvasElement;
  private confetti: Confetti;

  private state: State = 'closed';
  private monster: Monster | null = null;
  private rules: CatchRules = RULES.common;
  private triesLeft = TRIES;
  private timer = 0;

  constructor(
    parent: HTMLElement,
    /** Called when a monster is found; returns how many times it's been found now. */
    private onFound: (m: Monster) => number,
    /** Called when the screen closes. */
    private onClose: (outcome: Outcome) => void,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'encounter';
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="encounter__scene" hidden></div>
      <div class="encounter__box nes-box" role="dialog" aria-modal="true">
        <div class="encounter__title"><span class="encounter__type"></span><h2></h2></div>
        <div class="catch-stage">
          <div class="catch-monster"></div>
          <canvas class="catch-ring" width="${RING_CANVAS}" height="${RING_CANVAS}"></canvas>
        </div>
        <div class="encounter__tries" aria-label="Tries left"></div>
        <p class="encounter__message" aria-live="polite"></p>
        <p class="encounter__ability"></p>
        <div class="encounter__buttons">
          <button class="nes-button encounter__back" aria-label="Back">${BACK_ICON}</button>
          <button class="nes-button encounter__ok" aria-label="OK">${OK_ICON}</button>
        </div>
      </div>
      <canvas class="encounter__confetti"></canvas>`;
    parent.append(this.root);

    const q = (sel: string) => this.root.querySelector<HTMLElement>(sel)!;
    this.el = {
      title: q('h2'),
      type: q('.encounter__type'),
      monster: q('.catch-monster'),
      ability: q('.encounter__ability'),
      tries: q('.encounter__tries'),
      message: q('.encounter__message'),
      back: q('.encounter__back'),
      ok: q('.encounter__ok'),
    };
    this.ring = q('.catch-ring') as HTMLCanvasElement;
    this.confetti = new Confetti(q('.encounter__confetti') as HTMLCanvasElement);

    // Tap ANYWHERE on the screen to catch (except the buttons), and anywhere to carry on afterwards.
    this.root.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      if (this.showingResult) this.finishAfterAMoment();
      else this.tap();
    });
    this.el.back.addEventListener('click', () => this.leave());
    this.el.ok.addEventListener('click', () => this.finish());
    window.addEventListener('keydown', (e) => {
      if (this.state === 'closed' || (e.code !== 'Space' && e.code !== 'Enter')) return;
      e.preventDefault();
      if (e.repeat) return;
      if (this.showingResult) this.finishAfterAMoment();
      else this.tap();
    });
  }

  get isOpen(): boolean {
    return this.state !== 'closed';
  }

  private get showingResult(): boolean {
    return this.state === 'found' || this.state === 'away';
  }

  /**
   * Carry on from the result screen, but not in its first second, so a burst of
   * excited catch-taps doesn't skip straight past the celebration.
   */
  private finishAfterAMoment(): void {
    if (this.timer >= RESULT_MIN_SECONDS) this.finish();
  }

  /** True while the catch game is going (the exciting music plays then; it stops for the result). */
  get isCatching(): boolean {
    return this.state === 'intro' || this.state === 'ring' || this.state === 'almost';
  }

  /** Meet a monster. `bg` is the look behind the box (from the realm it was met in). */
  show(m: Monster, bg: EncounterBg): void {
    this.monster = m;
    this.rules = RULES[m.rarity];
    this.triesLeft = TRIES;
    this.state = 'intro';
    this.timer = 0;

    this.el.title.textContent = m.name;
    this.el.type.innerHTML = typeIconSvg(m.type, 32);
    this.el.type.title = m.type;
    this.el.ability.innerHTML = `<b></b> `;
    this.el.ability.querySelector('b')!.textContent = `${m.ability.name}:`;
    this.el.ability.append(m.ability.description);
    this.el.monster.className = 'catch-monster pop-in';
    this.el.monster.innerHTML = '';
    void monsterSvg(m, 'color').then((svg) => {
      if (this.monster === m) this.el.monster.innerHTML = svg;
    });
    this.setMessage(m.rarity === 'rare' ? 'A rare friend!' : `It's ${m.name}!`);
    this.drawTries();
    this.ring.hidden = false;
    drawRing(this.ring, this.rules, null);
    this.el.back.hidden = false;
    this.el.ok.hidden = true;
    this.root.className = `encounter rarity-${m.rarity}`;
    this.root.dataset.bg = bg === 'dim' ? 'dim' : 'scene';
    // A room picture behind the box (building worlds). The same canvas is reused every time.
    const sceneEl = this.root.querySelector<HTMLElement>('.encounter__scene')!;
    sceneEl.hidden = bg === 'dim';
    if (bg !== 'dim') sceneEl.replaceChildren(bg.scene());
    this.root.hidden = false;
    sfx.appear();
  }

  /** Called every frame by the game loop. */
  update(dt: number): void {
    this.confetti.update(dt);
    if (this.state === 'closed') return;
    this.timer += dt;

    if (this.state === 'intro' && this.timer >= INTRO_SECONDS) this.startRing();
    else if (this.state === 'ring') drawRing(this.ring, this.rules, ringScale(this.timer, this.rules));
    else if (this.state === 'almost' && this.timer >= ALMOST_SECONDS) this.startRing();
    else if (this.state === 'away' && this.timer >= AWAY_AUTO_CLOSE) this.finish();
  }

  private startRing(): void {
    this.state = 'ring';
    this.timer = 0;
    this.setMessage('Tap in the green!');
  }

  private tap(): void {
    if (this.state !== 'ring' || !this.monster) return;
    // A double-tap shouldn't use up two tries: ignore taps right as a new ring starts.
    if (this.timer < RING_START_GRACE) return;
    sfx.tap();
    if (inZone(ringScale(this.timer, this.rules), this.rules)) {
      this.found(this.monster);
      return;
    }
    this.triesLeft--;
    this.drawTries();
    if (this.triesLeft <= 0) {
      this.hopAway(this.monster);
    } else {
      this.state = 'almost';
      this.timer = 0;
      drawRing(this.ring, this.rules, null);
      this.setMessage('Almost! Try again!');
      sfx.almost();
    }
  }

  private found(m: Monster): void {
    this.state = 'found';
    this.timer = 0;
    const times = this.onFound(m);
    this.ring.hidden = true;
    this.el.title.textContent = `You found ${m.name}!`;
    this.el.monster.className = 'catch-monster celebrate';
    this.setMessage(times === 1 ? 'New friend!' : `Found ${times} times!`);
    this.el.back.hidden = true;
    this.el.ok.hidden = false;
    this.confetti.start();
    sfx.caught();
  }

  private hopAway(m: Monster): void {
    this.state = 'away';
    this.timer = 0;
    this.ring.hidden = true;
    this.el.monster.className = 'catch-monster hop-away';
    this.setMessage(`${m.name} hopped off to play! Find it again soon!`);
    this.el.back.hidden = true;
    this.el.ok.hidden = false;
    sfx.hopAway();
  }

  /** The back button: say bye, and the monster wanders off. */
  private leave(): void {
    sfx.click();
    this.close('left');
  }

  private finish(): void {
    if (this.state !== 'found' && this.state !== 'away') return;
    sfx.click();
    this.close(this.state === 'found' ? 'found' : 'away');
  }

  private close(outcome: Outcome): void {
    this.state = 'closed';
    this.monster = null;
    this.root.hidden = true;
    this.confetti.stop();
    this.onClose(outcome);
  }

  private drawTries(): void {
    this.el.tries.innerHTML = Array.from({ length: TRIES }, (_, i) => STAR(i < this.triesLeft)).join('');
  }

  private setMessage(text: string): void {
    this.el.message.textContent = text;
  }
}
