import { type Voice } from './instruments';

/**
 * The game's songs, written as text you can edit (all original tunes).
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

export type SongName = 'title' | 'explore' | 'cave' | 'catch' | 'home' | 'buntown' | 'cherrymart' | 'sunnyside';

export const SONGS: Record<SongName, Song> = {
  // The title screen: bright and bouncy, "let's go on an adventure!". F major, 8 bars of eighth notes.
  title: {
    bpm: 132,
    stepsPerBeat: 2,
    parts: [
      {
        voice: 'pulse',
        volume: 0.13,
        notes: `F5 . A5 . C6 . A5 . | Bb5 . A5 . G5 . F5 . | G5 . . A5 Bb5 . G5 . | A5 . . . C6 . . .
                D6 . C6 . Bb5 . A5 . | G5 . A5 . Bb5 . D6 . | C6 . A5 . G5 . E5 . | F5 . . . - - - -`,
      },
      {
        voice: 'triangle',
        volume: 0.22,
        notes: `F2 . C3 . F2 . C3 . | Bb2 . F3 . Bb2 . F3 . | C3 . G3 . C3 . G3 . | F2 . C3 . F2 . C3 .
                Bb2 . F3 . Bb2 . F3 . | G2 . D3 . G2 . D3 . | C3 . G3 . C3 . E3 . | F2 . C3 . F2 . - -`,
      },
      {
        voice: 'drums',
        volume: 0.05,
        notes: `k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k k s h
                k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k - - -`,
      },
    ],
  },

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

  // Home Sweet Home: warm and gentle, like a sunny Saturday morning at home. G major, 8 bars.
  home: {
    bpm: 104,
    stepsPerBeat: 2,
    parts: [
      {
        voice: 'triangle',
        volume: 0.2,
        notes: `G5 . B5 . D6 . B5 . | C6 . B5 . A5 . G5 . | A5 . . B5 C6 . A5 . | B5 . . . G5 . . .
                E5 . G5 . C6 . B5 . | A5 . G5 . F#5 . A5 . | G5 . B5 . A5 . F#5 . | G5 . . . - - - -`,
      },
      {
        voice: 'triangle',
        volume: 0.18,
        notes: `G2 . D3 . G2 . D3 . | C3 . G3 . C3 . G3 . | D3 . A3 . D3 . A3 . | G2 . D3 . G2 . D3 .
                C3 . G3 . C3 . G3 . | D3 . A3 . D3 . F#3 . | G2 . D3 . D3 . A3 . | G2 . D3 . G2 . - -`,
      },
      {
        // A soft music-box sparkle on top.
        voice: 'pulse',
        volume: 0.05,
        notes: `- - - - - - G6 - | - - - - - - E6 - | - - - - - - F#6 - | - - - - - - D6 -
                - - - - - - E6 - | - - - - - - D6 - | - - - - - - B5 - | - - - - - - - -`,
      },
      {
        voice: 'drums',
        volume: 0.035,
        notes: `k - h - s - h - | k - h - s - h - | k - h - s - h - | k - h - s - h -
                k - h - s - h - | k - h - s - h - | k - h - s - h - | k - h - s - - -`,
      },
    ],
  },

  // Bun Town Burgers: a bouncy diner tune, like a jukebox in a burger place. C major, 8 bars.
  buntown: {
    bpm: 144,
    stepsPerBeat: 2,
    parts: [
      {
        voice: 'pulse',
        volume: 0.13,
        notes: `C5 . E5 . G5 . A5 G5 | E5 . C5 . A4 . C5 . | F5 . A5 . C6 . A5 . | G5 . . F5 E5 . D5 .
                C5 E5 G5 . C6 . G5 . | A5 . G5 . E5 . C5 . | F5 . A5 . G5 . B5 . | C6 . . . - - - -`,
      },
      {
        // Little "chop" chords on the off-beats, like a diner piano.
        voice: 'square',
        volume: 0.05,
        notes: `- E4 - E4 - G4 - G4 | - C4 - C4 - E4 - E4 | - A4 - A4 - C5 - C5 | - B4 - B4 - D5 - D5
                - E4 - E4 - G4 - G4 | - C4 - C4 - E4 - E4 | - A4 - A4 - B4 - B4 | - E4 - E4 - - - -`,
      },
      {
        // A walking boogie bass.
        voice: 'triangle',
        volume: 0.22,
        notes: `C3 . E3 . G3 . A3 . | A2 . C3 . E3 . G3 . | F2 . A2 . C3 . D3 . | G2 . B2 . D3 . F3 .
                C3 . E3 . G3 . A3 . | A2 . C3 . E3 . G3 . | F2 . A2 . G2 . B2 . | C3 . G2 . C3 . - -`,
      },
      {
        voice: 'drums',
        volume: 0.05,
        notes: `k h s h k k s h | k h s h k k s h | k h s h k k s h | k h s h k k s h
                k h s h k k s h | k h s h k k s h | k h s h k k s h | k h s h s s s -`,
      },
    ],
  },

  // Cherry Mart: a bright, skippy shopping tune, like pushing a cart down a sunny aisle. G major, 8 bars.
  cherrymart: {
    bpm: 138,
    stepsPerBeat: 2,
    parts: [
      {
        voice: 'pulse',
        volume: 0.13,
        notes: `G5 . B5 . D6 . B5 . | C6 . B5 . A5 . G5 . | E5 . G5 . A5 . B5 . | A5 . . G5 F#5 . D5 .
                G5 . B5 . D6 . E6 . | D6 . B5 . G5 . E5 . | C6 . A5 . F#5 . A5 . | G5 . . . - - - -`,
      },
      {
        // Bouncy chords on the off-beats, like a cart's squeaky wheel keeping time.
        voice: 'square',
        volume: 0.05,
        notes: `- B4 - B4 - D5 - D5 | - C5 - C5 - E5 - E5 | - G4 - G4 - B4 - B4 | - F#4 - F#4 - A4 - A4
                - B4 - B4 - D5 - D5 | - G4 - G4 - B4 - B4 | - E4 - E4 - F#4 - F#4 | - B4 - B4 - - - -`,
      },
      {
        voice: 'triangle',
        volume: 0.22,
        notes: `G2 . D3 . G2 . D3 . | C3 . G3 . C3 . G3 . | E2 . B2 . E2 . B2 . | D2 . A2 . D2 . F#2 .
                G2 . D3 . G2 . D3 . | E2 . B2 . E2 . B2 . | C3 . C3 . D3 . D3 . | G2 . D3 . G2 . - -`,
      },
      {
        voice: 'drums',
        volume: 0.05,
        notes: `k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k k s h
                k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s s k - - -`,
      },
    ],
  },

  // Sunnyside Elementary: a cheerful school-bell tune, "ding-dong, time for class!". F major, 8 bars.
  sunnyside: {
    bpm: 132,
    stepsPerBeat: 2,
    parts: [
      {
        voice: 'pulse',
        volume: 0.13,
        notes: `C6 . A5 . C6 . A5 . | F5 . G5 . A5 . . . | Bb5 . A5 . G5 . F5 . | G5 . . . C5 . . .
                C6 . A5 . C6 . D6 . | C6 . A5 . F5 . A5 . | G5 . Bb5 . A5 . G5 . | F5 . . . - - - -`,
      },
      {
        // A little school bell ringing "ding-dong" at the start of each half.
        voice: 'square',
        volume: 0.04,
        notes: `F6 - C6 - F6 - C6 - | - - - - - - - - | - - - - - - - - | - - - - C6 - E6 -
                F6 - C6 - F6 - C6 - | - - - - - - - - | - - - - - - - - | - - - - C6 - F6 -`,
      },
      {
        voice: 'triangle',
        volume: 0.22,
        notes: `F2 . C3 . F2 . C3 . | F2 . C3 . A2 . C3 . | Bb2 . F3 . Bb2 . F3 . | C3 . G3 . C3 . E3 .
                F2 . C3 . F2 . C3 . | D3 . A3 . D3 . A3 . | Bb2 . F3 . C3 . E3 . | F2 . C3 . F2 . - -`,
      },
      {
        voice: 'drums',
        volume: 0.05,
        notes: `k h s h k h s h | k h s h k h s h | k h s h k h s h | k h s h k k s h
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
