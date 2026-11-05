import { type PlayerSpot, type SaveData, writeSave } from './save';

/**
 * Saves the game automatically:
 *   - every 5 seconds, if Layne has moved
 *   - whenever the page is hidden or closed (switching apps, closing the tab)
 *   - whenever the game asks (after a catch, after changing a setting)
 */
const EVERY_SECONDS = 5;

export class AutoSave {
  private enabled = true;
  private timer = 0;
  private lastSpot = '';

  constructor(
    private data: SaveData,
    /** Where Layne is right now. */
    private whereIsLayne: () => PlayerSpot,
  ) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.now();
    });
    window.addEventListener('pagehide', () => this.now());
  }

  /** Call every frame. */
  update(dt: number): void {
    this.timer += dt;
    if (this.timer < EVERY_SECONDS) return;
    this.timer = 0;
    if (this.spotKey(this.whereIsLayne()) !== this.lastSpot) this.now();
  }

  /** Save right now. */
  now(): void {
    if (!this.enabled) return;
    this.data.player = this.whereIsLayne();
    this.lastSpot = this.spotKey(this.data.player);
    writeSave(this.data);
  }

  /** Stop saving for good (used just before a reset/import reloads the page, so we don't save over it). */
  stop(): void {
    this.enabled = false;
  }

  private spotKey(p: PlayerSpot): string {
    return `${p.map}:${p.x.toFixed(2)}:${p.y.toFixed(2)}:${p.facing}`;
  }
}
