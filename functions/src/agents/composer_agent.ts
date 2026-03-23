/**
 * SynKrony Composer Agent
 *
 * Generates musical structures using Partimento - the historical
 * pedagogical method of teaching composition through realizing
 * a bass line with appropriate harmonies.
 *
 * Follows rules from:
 * - Fenaroli: Rule of the Octave
 * - Dufay: Early counterpoint practices
 * - Sala: Partimento realizations
 * - Brega tradition: Regional adaptations
 */

import {Scale, Chord, Progression, PartimentoRule, NoteData, KeySignature} from '../types';

// ============================================================================
// PARTIMENTO ENGINE
// ============================================================================

interface PartimentoBassNote {
  position: number;        // Position in beats
  pitch: number;           // MIDI note
  degree: number;          // Scale degree (0-6)
  duration: number;        // Duration in beats
}

interface ComposerRequest {
  key: KeySignature;
  mode: 'major' | 'minor';
  length_bars: number;
  tempo: number;
  genre?: 'brega' | 'forro' | 'tecnobrega' | 'classical';
  style?: string;
}

interface ComposerResponse {
  bass_line: PartimentoBassNote[];
  suggested_chords: string[];  // Chord IDs
  partimento_rules: string[];
  notes: NoteData[];
  description: string;
}

/**
 * Scale degrees for Partimento bass patterns
 */
const SCALE_DEGREES = [0, 1, 2, 3, 4, 5, 6];  // I to VII

/**
 * Partimento patterns by genre
 */
const PARTIMENTO_PATTERNS = {
  classical: {
    ascent: [0, 2, 4, 5, 7, 9, 11, 12],      // Diatonic ascent
    descent: [12, 11, 9, 7, 5, 4, 2, 0],     // Diatonic descent
    cadence: [0, 4, 7, 0],                    // I-V-I
  },
  brega: {
    ascent: [0, 2, 4, 5, 7, 9, 11, 12],      // Diatonic with emphasis
    descent: [12, 11, 9, 7, 5, 4, 2, 0],     // Smooth descent
    cadence: [0, 4, 7, 0, 7, 0],             // I-V-I with delay
  },
  forro: {
    ascent: [0, 2, 4, 5, 7, 9, 11, 12],      // Diatonic
    descent: [12, 11, 9, 7, 5, 4, 2, 0],     // With syncopation
    cadence: [0, 7, 0],                      // I-V-I (simpler)
  },
  tecnobrega: {
    ascent: [0, 3, 5, 7, 10, 12],            // Pentatonic minor flavor
    descent: [12, 10, 7, 5, 3, 0],           // Smooth
    cadence: [0, 7, 5, 0],                   // i-V-i
  },
};

/**
 * Rule of the Octave mappings (simplified)
 * Maps scale degrees to chord roots above the bass
 */
const RULE_OF_OCTAVE_MAJOR: Record<number, number[]> = {
  0: [0, 4, 7],       // I: Root position
  1: [2, 5, 9],       // II: First inversion (relative)
  2: [4, 7, 11],      // III: Root position
  3: [5, 9, 12],      // IV: First inversion
  4: [7, 11, 14],     // V: Root position
  5: [9, 12, 16],     // VI: First inversion (relative minor)
  6: [11, 14, 17],    // VII: Root position (leading tone to I)
};

const RULE_OF_OCTAVE_MINOR: Record<number, number[]> = {
  0: [0, 3, 7],       // i: Root position
  1: [2, 5, 8],       // iio: First inversion
  2: [3, 7, 10],      // III: Root position (major)
  3: [5, 8, 12],      // iv: First inversion
  4: [7, 10, 14],     // v: Root position
  5: [8, 12, 15],     // VI: Root position
  6: [11, 14, 17],    // VII: Root position (leading)
};

// ============================================================================
// AGENT FUNCTIONS
// ============================================================================

/**
 * Generate a Partimento bass line
 */
function generatePartimentoBass(
  request: ComposerRequest
): PartimentoBassNote[] {
  const {key, mode, length_bars, genre = 'classical'} = request;
  const pattern = PARTIMENTO_PATTERNS[genre] || PARTIMENTO_PATTERNS.classical;

  const bass: PartimentoBassNote[] = [];
  const rootNote = noteNameToMidi(key.key);
  const beatsPerBar = 4;  // Assuming 4/4
  const totalBeats = length_bars * beatsPerBar;

  // Determine pattern based on genre
  let bassPattern: number[] = pattern.ascent;
  let position = 0;

  // Generate bass line
  for (let bar = 0; bar < length_bars; bar++) {
    // Add cadence at the end
    if (bar === length_bars - 2 || bar === length_bars - 1) {
      for (const note of pattern.cadence) {
        bass.push({
          position: position * beatsPerBar,
          pitch: rootNote + note,
          degree: getScaleDegree(note, mode),
          duration: genre === 'forro' ? 1 : 2,  // Faster notes in forró
        });
        position += 1;
      }
    } else {
      // Regular pattern - use ascent and descent
      const patternNote = bassPattern[bar % bassPattern.length];
      bass.push({
        position: bar * beatsPerBar,
        pitch: rootNote + patternNote,
        degree: getScaleDegree(patternNote, mode),
        duration: genre === 'forro' ? 2 : 4,
      });

      // Add syncopation for forró
      if (genre === 'forro' && bar % 2 === 0) {
        bass.push({
          position: bar * beatsPerBar + 2,
          pitch: rootNote + patternNote,
          degree: getScaleDegree(patternNote, mode),
          duration: 1,
        });
      }
    }
  }

  return bass;
}

/**
 * Get scale degree from interval
 */
function getScaleDegree(interval: number, mode: 'major' | 'minor'): number {
  const majorDegrees = [0, 2, 4, 5, 7, 9, 11];
  const minorDegrees = [0, 2, 3, 5, 7, 8, 10];

  const degrees = mode === 'major' ? majorDegrees : minorDegrees;
  const normalizedInterval = ((interval % 12) + 12) % 12;

  const degreeIndex = degrees.indexOf(normalizedInterval);
  return degreeIndex >= 0 ? degreeIndex : 0;
}

/**
 * Convert note name to MIDI note number
 */
function noteNameToMidi(noteName: string): number {
  const notes: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  const match = noteName.match(/^([A-G][b#]?)(-?\d+)?$/);
  if (!match) return 60;  // Default to C4

  const note = match[1];
  const octave = match[2] ? parseInt(match[2]) : 4;

  return octave * 12 + (notes[note] || 0);
}

/**
 * Suggest chords for bass line based on Partimento rules
 */
function suggestChordsForBass(
  bass: PartimentoBassNote[],
  mode: 'major' | 'minor',
  genre?: string
): string[] {
  const rules = mode === 'major' ? RULE_OF_OCTAVE_MAJOR : RULE_OF_OCTAVE_MINOR;
  const chords: string[] = [];

  for (const note of bass) {
    const degree = note.degree;
    const voicing = rules[degree] || [0, 4, 7];

    // Determine chord quality based on degree and mode
    let chordType = 'major';
    if (mode === 'minor') {
      if (degree === 1) chordType = 'diminished';
      else if (degree === 5) chordType = 'major';  // III in minor
      else chordType = 'minor';
    } else {
      if (degree === 6) chordType = 'diminished';
      else if (degree === 1 || degree === 2 || degree === 5) {
        chordType = 'minor';  // ii, iii, vi
      }
    }

    // Regional adaptations
    if (genre === 'brega' && degree === 4) {
      chordType = 'dominant7';  // V7 in brega
    }

    chords.push(`${note.pitch}-${chordType}`);
  }

  return chords;
}

/**
 * Convert bass line to NoteData format
 */
function bassToNotes(bass: PartimentoBassNote[]): NoteData[] {
  const ticksPerBeat = 960;

  return bass.map((note, index) => ({
    id: `bass_${index}`,
    pitch: note.pitch,
    duration: note.duration * ticksPerBeat,
    velocity: 100,
    position: note.position * ticksPerBeat,
    partimento_degree: note.degree,
    articulations: ['legato'],
  }));
}

/**
 * Main agent function - generates Partimento composition
 */
export async function composerAgent(request: ComposerRequest): Promise<ComposerResponse> {
  const {
    key,
    mode,
    length_bars,
    tempo,
    genre = 'classical',
    style
  } = request;

  // Generate Partimento bass line
  const bass_line = generatePartimentoBass(request);

  // Suggest chords
  const suggested_chords = suggestChordsForBass(bass_line, mode, genre);

  // Convert to NoteData
  const notes = bassToNotes(bass_line);

  // Generate description
  const description = generateDescription(request, bass_line, suggested_chords);

  return {
    bass_line,
    suggested_chords,
    partimento_rules: [
      `rule_of_octave_${mode}`,
      genre === 'brega' ? 'rule_brega_cadence' : null,
      genre === 'forro' ? 'rule_forro_syncopation' : null,
    ].filter(Boolean) as string[],
    notes,
    description,
  };
}

/**
 * Generate human-readable description
 */
function generateDescription(
  request: ComposerRequest,
  bass: PartimentoBassNote[],
  chords: string[]
): string {
  const {key, mode, length_bars, genre} = request;

  return `Partimento em ${key.key} ${mode === 'major' ? 'Maior' : 'Menor'} (${genre})
  - Compassos: ${length_bars}
  - Andamento: ${request.tempo} BPM
  - Notas do baixo: ${bass.length}
  - Acordes sugeridos: ${chords.length}
  - Regras aplicadas: Regra da Oitava${genre === 'brega' ? ' (adaptada Brega)' : genre === 'forro' ? ' (adaptada Forró)' : ''}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {ComposerRequest, ComposerResponse, PartimentoBassNote};
