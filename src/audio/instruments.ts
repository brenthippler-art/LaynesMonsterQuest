/**
 * NES-style instruments, built from basic waves:
 *   pulse    a "25% pulse" wave: the classic thin, bright NES lead sound
 *   square   a fuller 50% square wave
 *   triangle soft and round (the NES used it for bass)
 *   drums    kick (a quick falling tone), snare and hat (bursts of noise)
 */
export type Voice = 'pulse' | 'square' | 'triangle' | 'drums';

const pulseWaves = new WeakMap<AudioContext, PeriodicWave>();
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

/** A pulse wave that's "on" 25% of the time, made by adding up sine waves. */
function pulseWave(ctx: AudioContext): PeriodicWave {
  let wave = pulseWaves.get(ctx);
  if (!wave) {
    const duty = 0.25;
    const harmonics = 32;
    const real = new Float32Array(harmonics);
    const imag = new Float32Array(harmonics);
    for (let n = 1; n < harmonics; n++) real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
    wave = ctx.createPeriodicWave(real, imag);
    pulseWaves.set(ctx, wave);
  }
  return wave;
}

/** One second of random noise, reused for every drum hit (and the "whoosh" sound effect). */
export function noise(ctx: AudioContext): AudioBuffer {
  let buf = noiseBuffers.get(ctx);
  if (!buf) {
    buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buf);
  }
  return buf;
}

/** Fade in fast, hold, fade out at the end: no clicks. */
function envelope(ctx: AudioContext, t: number, dur: number, volume: number): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.008);
  g.gain.setValueAtTime(volume, t + Math.max(0.01, dur - 0.04));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return g;
}

/** Play one note at audio time `t` for `dur` seconds into `out`. */
export function playNote(ctx: AudioContext, out: AudioNode, voice: Exclude<Voice, 'drums'>, freq: number, t: number, dur: number, volume: number): void {
  const osc = ctx.createOscillator();
  if (voice === 'pulse') osc.setPeriodicWave(pulseWave(ctx));
  else osc.type = voice;
  osc.frequency.setValueAtTime(freq, t);
  osc.connect(envelope(ctx, t, dur, volume)).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** Play a drum: 'k' kick, 's' snare, 'h' hi-hat. */
export function playDrum(ctx: AudioContext, out: AudioNode, kind: string, t: number, volume: number): void {
  if (kind === 'k') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    osc.connect(envelope(ctx, t, 0.14, volume * 1.6)).connect(out);
    osc.start(t);
    osc.stop(t + 0.16);
    return;
  }
  const src = ctx.createBufferSource();
  src.buffer = noise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = kind === 's' ? 1200 : 7000;
  const dur = kind === 's' ? 0.12 : 0.04;
  src.connect(filter).connect(envelope(ctx, t, dur, kind === 's' ? volume : volume * 0.5)).connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}
