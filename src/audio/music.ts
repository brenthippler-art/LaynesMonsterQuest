import { engine } from './engine';
import { playDrum, playNote } from './instruments';
import { noteFreq } from './notes';
import { type Song, type SongName, SONGS } from './tracks';

/**
 * The music player. Call play('explore' | 'cave' | 'catch' | null) whenever
 * you like (every frame is fine); it only does something when the song changes,
 * crossfading from the old song to the new one.
 *
 * How it keeps perfect time: every 25 ms it looks a little way ahead and books
 * the next notes on the audio clock, which is much steadier than JavaScript timers.
 */
const LOOKAHEAD = 0.15; // seconds of music booked ahead
const TICK_MS = 25;
const FADE = 0.4; // seconds to crossfade between songs

interface Event {
  /** Note frequency, or a drum letter. */
  sound: number | string;
  /** How many steps it lasts. */
  steps: number;
}

/** A song turned into, for each part, "what starts on each step" (null = nothing new). */
interface Prepared {
  song: Song;
  length: number;
  parts: (Event | null)[][];
}

function prepare(song: Song): Prepared {
  const parts = song.parts.map((part) => {
    const tokens = part.notes.split(/\s+/).filter((t) => t && t !== '|');
    const events: (Event | null)[] = tokens.map(() => null);
    let current: Event | null = null;
    tokens.forEach((tok, i) => {
      if (tok === '.') {
        if (current) current.steps++;
      } else if (tok === '-') {
        current = null;
      } else {
        current = { sound: part.voice === 'drums' ? tok : noteFreq(tok), steps: 1 };
        events[i] = current;
      }
    });
    return events;
  });
  const length = Math.max(...parts.map((p) => p.length));
  if (import.meta.env.DEV && parts.some((p) => p.length !== length)) {
    console.warn('A song has parts with different numbers of steps:', parts.map((p) => p.length));
  }
  return { song, length, parts };
}

const PREPARED = Object.fromEntries(Object.entries(SONGS).map(([name, song]) => [name, prepare(song)])) as Record<SongName, Prepared>;

class Music {
  private wanted: SongName | null = null;
  private playing: SongName | null = null;
  private out: GainNode | null = null;
  /** Every audio node the current song created (so they can all be unplugged later). */
  private nodes: AudioNode[] = [];
  private step = 0;
  private nextTime = 0;

  constructor() {
    setInterval(() => this.tick(), TICK_MS);
  }

  /** Ask for a song (null = silence). Safe to call every frame. */
  play(name: SongName | null): void {
    this.wanted = name;
  }

  private tick(): void {
    const ctx = engine.ctx;
    if (!ctx || !engine.ready) return;
    if (this.wanted !== this.playing) this.switchTo(ctx, this.wanted);
    if (!this.playing || !this.out || engine.muted) {
      if (engine.muted) this.nextTime = Math.max(this.nextTime, ctx.currentTime); // don't pile up notes while muted
      return;
    }

    const prepared = PREPARED[this.playing];
    const stepSeconds = 60 / prepared.song.bpm / prepared.song.stepsPerBeat;
    if (this.nextTime < ctx.currentTime) this.nextTime = ctx.currentTime + 0.05; // fell behind (e.g. tab was hidden)
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      prepared.parts.forEach((events, i) => {
        const e = events[this.step];
        if (!e) return;
        const part = prepared.song.parts[i];
        if (typeof e.sound === 'string') playDrum(ctx, this.out!, e.sound, this.nextTime, part.volume);
        else if (part.voice !== 'drums') playNote(ctx, this.out!, part.voice, e.sound, this.nextTime, e.steps * stepSeconds * 0.95, part.volume);
      });
      this.nextTime += stepSeconds;
      this.step = (this.step + 1) % prepared.length;
    }
  }

  /** Fade the old song out and start the new one from the top. */
  private switchTo(ctx: AudioContext, name: SongName | null): void {
    const now = ctx.currentTime;
    if (this.out) {
      this.out.gain.setTargetAtTime(0, now, FADE / 3);
      const oldNodes = this.nodes;
      // Wait for the fade (and any echo) to die away, then unplug everything.
      setTimeout(() => oldNodes.forEach((node) => node.disconnect()), (FADE + 2) * 1000);
    }
    this.playing = name;
    this.out = null;
    this.nodes = [];
    if (!name) return;

    const out = ctx.createGain();
    this.nodes.push(out);
    out.gain.setValueAtTime(0.0001, now);
    out.gain.setTargetAtTime(1, now, FADE / 3);
    out.connect(engine.musicBus);
    if (PREPARED[name].song.echo) {
      // Echo: a copy of the sound, delayed and quieter, fed back into itself a few times.
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.36;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.35;
      const wet = ctx.createGain();
      wet.gain.value = 0.4;
      out.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(wet).connect(engine.musicBus);
      this.nodes.push(delay, feedback, wet);
    }
    this.out = out;
    this.step = 0;
    this.nextTime = now + 0.05;
  }
}

export const music = new Music();
