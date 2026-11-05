/**
 * The one audio system everything plays through:
 *
 *   sound effects ─► sfx bus ──┐
 *                              ├─► master (mute) ─► speakers
 *   music ─────────► music bus ┘
 *
 * Browsers only allow sound after the player touches or presses something,
 * so unlock() is called from the first tap/keypress. Until then, nothing plays.
 */
const MUSIC_VOLUME = 0.32; // music sits quietly under the sound effects

class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  sfxBus!: GainNode;
  musicBus!: GainNode;
  private _muted = false;

  constructor() {
    // Pause all sound while the game isn't visible (switched apps, other tab); resume when back.
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.visibilityState === 'hidden') this.ctx.suspend().catch(() => {});
      else this.ctx.resume().catch(() => {}); // if the browser says no, the next tap wakes it
    });
  }

  get muted(): boolean {
    return this._muted;
  }

  /** True once sound is allowed and running. */
  get ready(): boolean {
    return this.ctx?.state === 'running';
  }

  /** Create/wake the audio system. Safe to call often. */
  unlock(): void {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = this._muted ? 0 : 1;
        this.master.connect(this.ctx.destination);
        this.sfxBus = this.ctx.createGain();
        this.sfxBus.connect(this.master);
        this.musicBus = this.ctx.createGain();
        this.musicBus.gain.value = MUSIC_VOLUME;
        this.musicBus.connect(this.master);
      }
      // 'suspended' (not started yet / tab was hidden) or 'interrupted' (iPad: a phone call or alarm).
      const state = this.ctx.state as string;
      if (state !== 'running' && state !== 'closed' && document.visibilityState === 'visible') {
        this.ctx.resume().catch(() => {
          // Not allowed yet; the next tap will try again.
        });
      }
    } catch {
      // No audio on this device: the game is silent but works fine.
    }
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
  }
}

export const engine = new AudioEngine();
