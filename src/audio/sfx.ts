import { engine } from './engine';
import { noteFreq } from './notes';

/**
 * Sound effects: little square/triangle-wave beeps like an old game console,
 * made from scratch. No sound files, nothing downloaded.
 */
type Wave = OscillatorType;

class Sfx {
  /** Wake the audio system (call from a tap/keypress). */
  unlock(): void {
    engine.unlock();
  }

  /** One beep: starts `at` seconds from now, lasts `dur`, optionally sliding to another pitch. */
  private tone(freq: number, at: number, dur: number, wave: Wave = 'square', volume = 0.12, slideTo?: number): void {
    const ctx = engine.ctx;
    if (!ctx || engine.muted) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    // Quick fade in and out so there are no clicks.
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(engine.sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private melody(notes: string[], step: number, wave: Wave = 'square', volume = 0.12): void {
    notes.forEach((note, i) => this.tone(noteFreq(note), i * step, step * 1.6, wave, volume));
  }

  /** A monster appears! */
  appear(): void {
    this.melody(['C5', 'E5', 'G5', 'C6'], 0.07);
  }

  /** The player taps to catch. */
  tap(): void {
    this.tone(noteFreq('A5'), 0, 0.06, 'square', 0.08);
  }

  /** "Almost!": soft and friendly, not a buzzer. */
  almost(): void {
    this.tone(noteFreq('G4'), 0, 0.12, 'triangle', 0.18);
    this.tone(noteFreq('C5'), 0.12, 0.18, 'triangle', 0.18);
  }

  /** Caught it! A happy fanfare. */
  caught(): void {
    this.melody(['C5', 'E5', 'G5', 'C6'], 0.09);
    this.melody(['G5', 'C6', 'E6'], 0.14, 'square', 0.1);
    this.tone(noteFreq('C4'), 0, 0.6, 'triangle', 0.2); // bass note underneath
  }

  /** The monster hops away to play: two bouncy boings. */
  hopAway(): void {
    this.tone(300, 0, 0.18, 'triangle', 0.2, 700);
    this.tone(350, 0.22, 0.18, 'triangle', 0.2, 900);
  }

  /** A soft click for buttons. */
  click(): void {
    this.tone(noteFreq('E5'), 0, 0.04, 'square', 0.06);
  }
}

export const sfx = new Sfx();
