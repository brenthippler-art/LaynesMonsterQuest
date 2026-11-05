import { type Voice } from './instruments';

/**
 * The game's three songs, written as text you can edit (all original tunes).
 *
 * Each part is a list of steps, separated by spaces ("|" between bars is
 * just to help you read it):
 *   C5   play the note C in octave 5 (C#5 / Bb4 work too)
 *   .    keep holding the previous note one more step
 *   -    silence
 *   k s h  kick, snare, hi-hat (drums only)
 *
 * Every part in a song must have the same number of steps (they loop together).
 */
export interface Part {
  voice: Voice;
  volume: number;
  notes: string;
}

export interface Song {
  /** Beats per minute. */
  bpm: number;
  /** Steps per beat: 2 = eighth notes, 4 = sixteenth notes. */
  stepsPerBeat: number;
  /** Add a soft echo (sounds like a big cave). */
  echo?: boolean;
  parts: Part[];
}

export type SongName = 'explore' | 'cave' | 'catch';

export const SONGS: Record<SongName, Song> = {
  // Cheerful and bouncy: walking around in the sunshine. C major, 8 bars of eighth notes.
  explore: {
    bpm: 116,
    stepsPerBeat: 2,
    parts: [
      {
        voice: 'pulse',
        volume: 0.13,
        notes: `E5 . G5 . C6 . G5 . | A5 . . G5 E5 . C5 . | F5 . A5 . C6 . A5 . | G5 . . . D5 . G5 .
                E5 G5 C6 . B5 . G5 . | A5 . E5 . C5 . E5 . | F5 . A5 . G5 . B5 . | C6 . . . - - - -`,
      },
      {
        voice: 'triangle',
        volume: 0.22,
        notes: `C3 . G3 . C3 . G3 . | A2 . E3 . A2 . E3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . D3 .
                C3 . G3 . C3 . G3 . | A2 . E3 . A2 . E3 . | F2 . C3 . G2 . D3 . | C3 . G3 . C3 . - -`,
      },
      {
        voice: 'drums',
        volume: 0.05,
        notes: `k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k h s h
                k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k - - -`,
      },
    ],
  },

  // Mysterious, not scary: slow, quiet and echoey, like exploring a big hall of crystals. A minor.
  cave: {
    bpm: 76,
    stepsPerBeat: 2,
    echo: true,
    parts: [
      {
        voice: 'triangle',
        volume: 0.2,
        notes: `A4 . . . C5 . . . | E5 . . . D5 . C5 . | B4 . . . A4 . . . | G#4 . . . . . - -
                A4 . C5 . E5 . A5 . | G5 . . F5 E5 . . . | D5 . C5 . B4 . . . | B4 . . . G#4 . . .`,
      },
      {
        voice: 'triangle',
        volume: 0.16,
        notes: `A2 . . . . . . . | A2 . . . . . . . | F2 . . . . . . . | E2 . . . . . . .
                A2 . . . . . . . | D2 . . . . . . . | F2 . . . . . . . | E2 . . . . . . .`,
      },
      {
        // Little "drip" sparkles, like water in a cave.
        voice: 'pulse',
        volume: 0.04,
        notes: `- - - - - - E6 - | - - - - - - - - | - - - C6 - - - - | - - - - - - - B5
                - - - - - - E6 - | - - - - - A6 - - | - - - - - - - - | - - - D6 - - - -`,
      },
    ],
  },

  // High energy for catching! Fast sixteenth notes and drums. G major, 4 bars.
  catch: {
    bpm: 150,
    stepsPerBeat: 4,
    parts: [
      {
        voice: 'square',
        volume: 0.09,
        notes: `G5 . B5 . D6 . B5 . G5 . B5 . D6 . G6 . | E5 . G5 . B5 . G5 . E5 . G5 . B5 . E6 .
                C5 . E5 . G5 . E5 . C6 . G5 . E5 . G5 . | D5 . F#5 . A5 . F#5 . D6 . . . A5 . . .`,
      },
      {
        voice: 'triangle',
        volume: 0.24,
        notes: `G2 . G3 . G2 . G3 . G2 . G3 . G2 . G3 . | E2 . E3 . E2 . E3 . E2 . E3 . E2 . E3 .
                C2 . C3 . C2 . C3 . C2 . C3 . C2 . C3 . | D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .`,
      },
      {
        voice: 'drums',
        volume: 0.06,
        notes: `k - h - s - h - k - h k s - h h | k - h - s - h - k - h k s - h h
                k - h - s - h - k - h k s - h h | k - h - s - h - k k s - s s s s`,
      },
    ],
  },
};
