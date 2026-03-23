/**
 * SynKrony Theorist Agent
 *
 * Applies music theory knowledge to compositions and arrangements.
 * Provides analysis, suggestions, and educational insights about:
 * - Harmony and chord progressions
 * - Scale relationships and modulations
 * - Counterpoint analysis
 * - Voice leading principles
 * - Regional theory adaptations (Brega, Forró)
 */

import {NoteData, Chord, Scale, Progression} from '../types';

// ============================================================================
// THEORY ENGINE
// ============================================================================

interface TheoristRequest {
  notes: NoteData[];
  key: string;
  mode: 'major' | 'minor';
  genre?: string;
  analysis_type?: 'harmony' | 'counterpoint' | 'voice_leading' | 'full';
}

interface TheoristResponse {
  analysis: {
    key_center: string;
    scale_used: string;
    chords_found: ChordAnalysis[];
    modulations: ModulationAnalysis[];
  };
  harmony: HarmonyAnalysis;
  counterpoint: CounterpointAnalysis;
  voice_leading: VoiceLeadingAnalysis;
  suggestions: string[];
  educational_notes: string[];
}

interface ChordAnalysis {
  position: number;
  root: string;
  quality: string;
  inversion: number;
  notes: string[];
  function?: string;
}

interface ModulationAnalysis {
  from_key: string;
  to_key: string;
  position: number;
  type: string;
}

interface HarmonyAnalysis {
  progression: string[];
  cadences: string[];
  tension_points: number[];
  functional_analysis: string;
}

interface CounterpointAnalysis {
  species_detected: number;
  violations: string[];
  strengths: string[];
  independence_score: number;
}

interface VoiceLeadingAnalysis {
  smoothness: number;
  parallel_movements: number[];
  recommended_improvements: string[];
}

// ============================================================================
// CHORD RECOGNITION
// ============================================================================

/**
 * Recognize chord from a set of notes
 */
function recognizeChord(notes: NoteData[], rootNote: number): ChordAnalysis | null {
  if (notes.length === 0) return null;

  const pitches = notes.map(n => n.pitch).sort((a, b) => a - b);
  const bass = pitches[0];

  // Calculate intervals from bass
  const intervals = pitches.map(p => ((p - bass) % 12 + 12) % 12);

  // Major triad: 0, 4, 7
  if (hasIntervals(intervals, [0, 4, 7])) {
    return {
      position: notes[0].position,
      root: midiToNoteName(bass),
      quality: 'major',
      inversion: getInversion(bass, pitches, [0, 4, 7]),
      notes: pitches.map(midiToNoteName),
    };
  }

  // Minor triad: 0, 3, 7
  if (hasIntervals(intervals, [0, 3, 7])) {
    return {
      position: notes[0].position,
      root: midiToNoteName(bass),
      quality: 'minor',
      inversion: getInversion(bass, pitches, [0, 3, 7]),
      notes: pitches.map(midiToNoteName),
    };
  }

  // Diminished triad: 0, 3, 6
  if (hasIntervals(intervals, [0, 3, 6])) {
    return {
      position: notes[0].position,
      root: midiToNoteName(bass),
      quality: 'diminished',
      inversion: getInversion(bass, pitches, [0, 3, 6]),
      notes: pitches.map(midiToNoteName),
    };
  }

  // Dominant 7th: 0, 4, 7, 10
  if (hasIntervals(intervals, [0, 4, 7, 10])) {
    return {
      position: notes[0].position,
      root: midiToNoteName(bass),
      quality: 'dominant7',
      inversion: getInversion(bass, pitches, [0, 4, 7, 10]),
      notes: pitches.map(midiToNoteName),
    };
  }

  // Major 7th: 0, 4, 7, 11
  if (hasIntervals(intervals, [0, 4, 7, 11])) {
    return {
      position: notes[0].position,
      root: midiToNoteName(bass),
      quality: 'major7',
      inversion: getInversion(bass, pitches, [0, 4, 7, 11]),
      notes: pitches.map(midiToNoteName),
    };
  }

  return null;
}

/**
 * Check if intervals contain all required intervals
 */
function hasIntervals(intervals: number[], required: number[]): boolean {
  const normalized = [...new Set(intervals)].sort((a, b) => a - b);
  return required.every(r => normalized.includes(r));
}

/**
 * Determine chord inversion
 */
function getInversion(bass: number, pitches: number[], rootIntervals: number[]): number {
  // Root position: bass is root
  if (pitches[0] === bass) return 0;

  // First inversion: third in bass
  const third = bass + rootIntervals[1];
  if (pitches.includes(third)) return 1;

  // Second inversion: fifth in bass
  const fifth = bass + rootIntervals[2];
  if (pitches.includes(fifth)) return 2;

  // Third inversion (for 7th chords): seventh in bass
  if (rootIntervals[3]) {
    const seventh = bass + rootIntervals[3];
    if (pitches.includes(seventh)) return 3;
  }

  return 0;
}

/**
 * MIDI note to note name
 */
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  return noteNames[midi % 12] + octave;
}

/**
 * Note name to MIDI
 */
function noteNameToMidi(noteName: string): number {
  const notes: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };

  const match = noteName.match(/^([A-G][b#]?)(-?\d+)?$/);
  if (!match) return 60;

  const note = match[1];
  const octave = match[2] ? parseInt(match[2]) : 4;
  return octave * 12 + (notes[note] || 0);
}

// ============================================================================
// HARMONIC ANALYSIS
// ============================================================================

/**
 * Analyze harmony of a note sequence
 */
function analyzeHarmony(notes: NoteData[], key: string, mode: 'major' | 'minor'): HarmonyAnalysis {
  const rootNote = noteNameToMidi(key);
  const scale = mode === 'major'
    ? [0, 2, 4, 5, 7, 9, 11]
    : [0, 2, 3, 5, 7, 8, 10];

  // Group notes by position to find chords
  const positionMap = new Map<number, NoteData[]>();
  for (const note of notes) {
    const measurePos = Math.floor(note.position / 3840) * 3840;  // Group by beat
    if (!positionMap.has(measurePos)) {
      positionMap.set(measurePos, []);
    }
    positionMap.get(measurePos)!.push(note);
  }

  // Analyze chords at each position
  const progression: string[] = [];
  const chords: ChordAnalysis[] = [];

  for (const [pos, posNotes] of positionMap) {
    const chord = recognizeChord(posNotes, rootNote);
    if (chord) {
      progression.push(`${chord.root}${chord.quality === 'major' ? '' : chord.quality === 'minor' ? 'm' : chord.quality}`);
      chords.push(chord);
    }
  }

  // Detect cadences
  const cadences: string[] = [];
  if (progression.length >= 2) {
    const last = progression[progression.length - 1];
    const secondLast = progression[progression.length - 2];

    // V-I authentic cadence
    if (secondLast.includes('5') || secondLast.includes('7')) {
      if (last.includes('1') && !last.includes('m')) {
        cadences.push('V-I Authentic Cadence');
      }
    }

    // IV-I plagal cadence
    if (secondLast.includes('4')) {
      if (last.includes('1') && !last.includes('m')) {
        cadences.push('IV-I Plagal Cadence');
      }
    }

    // V-vi deceptive cadence
    if (secondLast.includes('5') || secondLast.includes('7')) {
      if (last.includes('6m') || last.includes('6')) {
        cadences.push('V-vi Deceptive Cadence');
      }
    }
  }

  // Functional analysis
  const functional_analysis = analyzeFunctionalHarmony(chords, key, mode);

  return {
    progression,
    cadences,
    tension_points: chords.filter(c => c.quality === 'dominant7' || c.quality === 'diminished').map(c => c.position),
    functional_analysis
  };
}

/**
 * Analyze functional harmony
 */
function analyzeFunctionalHarmony(chords: ChordAnalysis[], key: string, mode: 'major' | 'minor'): string {
  if (chords.length === 0) return 'No harmony detected';

  const functions = chords.map(chord => {
    const root = chord.root.replace(/[0-9]/g, '');
    const keyRoot = key.replace(/[m]/g, '');

    // Tonic function (I)
    if (root === keyRoot) return 'T';

    // Dominant function (V)
    const dominant = noteNameToMidi(key) + 7;
    if (noteNameToMidi(root) === dominant) return 'D';

    // Subdominant function (IV)
    const subdominant = noteNameToMidi(key) + 5;
    if (noteNameToMidi(root) === subdominant) return 'S';

    return '?';
  });

  return `Functional Analysis: ${functions.join('-')}`;
}

// ============================================================================
// COUNTERPOINT ANALYSIS
// ============================================================================

/**
 * Analyze counterpoint quality
 */
function analyzeCounterpoint(notes: NoteData[]): CounterpointAnalysis {
  const violations: string[] = [];
  const strengths: string[] = [];

  // Check for parallel fifths
  const parallelFifths = findParallelIntervals(notes, 7);
  if (parallelFifths.length > 0) {
    violations.push(`Found ${parallelFifths.length} parallel fifths`);
  } else {
    strengths.push('No parallel fifths detected');
  }

  // Check for parallel octaves
  const parallelOctaves = findParallelIntervals(notes, 12);
  if (parallelOctaves.length > 0) {
    violations.push(`Found ${parallelOctaves.length} parallel octaves`);
  } else {
    strengths.push('No parallel octaves detected');
  }

  // Determine species based on rhythm
  const species = determineSpecies(notes);

  return {
    species_detected: species,
    violations,
    strengths,
    independence_score: calculateIndependenceScore(notes, violations.length)
  };
}

/**
 * Find parallel intervals
 */
function findParallelIntervals(notes: NoteData[], interval: number): number[] {
  const positions: number[] = [];

  // Simplified - would need actual voice separation for real analysis
  return positions;
}

/**
 * Determine counterpoint species
 */
function determineSpecies(notes: NoteData[]): number {
  if (notes.length < 2) return 1;

  const durations = notes.map(n => n.duration);
  const uniqueDurations = [...new Set(durations)];

  if (uniqueDurations.length === 1) return 1;  // First species
  if (uniqueDurations.length === 2) return 2;  // Second species
  if (uniqueDurations.length > 3) return 5;    // Florid

  return 3;
}

/**
 * Calculate voice independence score
 */
function calculateIndependenceScore(notes: NoteData[], violations: number): number {
  const baseScore = 100;
  const penalty = violations * 15;
  return Math.max(0, baseScore - penalty);
}

// ============================================================================
// VOICE LEADING ANALYSIS
// ============================================================================

/**
 * Analyze voice leading quality
 */
function analyzeVoiceLeading(notes: NoteData[]): VoiceLeadingAnalysis {
  let smoothness = 0;
  const parallel_movements: number[] = [];
  const recommended_improvements: string[] = [];

  // Calculate average melodic interval size
  for (let i = 1; i < notes.length; i++) {
    const interval = Math.abs(notes[i].pitch - notes[i-1].pitch);
    smoothness += interval;
  }

  smoothness = notes.length > 1 ? smoothness / (notes.length - 1) : 0;

  // Good voice leading has small intervals (stepwise motion)
  if (smoothness > 3) {
    recommended_improvements.push('Consider using more stepwise motion for smoother voice leading');
  }

  return {
    smoothness: Math.round(smoothness * 10) / 10,
    parallel_movements,
    recommended_improvements
  };
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

export async function theoristAgent(request: TheoristRequest): Promise<TheoristResponse> {
  const {
    notes,
    key,
    mode,
    genre = 'classical',
    analysis_type = 'full'
  } = request;

  // Group notes into chords
  const positionMap = new Map<number, NoteData[]>();
  for (const note of notes) {
    const measurePos = Math.floor(note.position / 3840) * 3840;
    if (!positionMap.has(measurePos)) {
      positionMap.set(measurePos, []);
    }
    positionMap.get(measurePos)!.push(note);
  }

  // Recognize chords
  const chords_found: ChordAnalysis[] = [];
  for (const [pos, posNotes] of positionMap) {
    const chord = recognizeChord(posNotes, noteNameToMidi(key));
    if (chord) {
      chords_found.push(chord);
    }
  }

  // Analyze harmony
  const harmony = analyzeHarmony(notes, key, mode);

  // Analyze counterpoint
  const counterpoint = analyzeCounterpoint(notes);

  // Analyze voice leading
  const voice_leading = analyzeVoiceLeading(notes);

  // Generate suggestions
  const suggestions: string[] = [];

  if (genre === 'brega') {
    suggestions.push('Brega style allows for more emotional freedom - consider adding suspensions');
    suggestions.push('Try incorporating descending chromatic lines for dramatic effect');
  } else if (genre === 'forro') {
    suggestions.push('Forró benefits from clear rhythmic patterns in the bass');
    suggestions.push('Consider using open voicings for a more authentic regional sound');
  }

  if (counterpoint.violations.length > 0) {
    suggestions.push(`Address counterpoint violations: ${counterpoint.violations.join(', ')}`);
  }

  if (voice_leading.smoothness > 4) {
    suggestions.push('Voice leading could be smoother - consider smaller intervals');
  }

  // Educational notes
  const educational_notes: string[] = [];

  if (harmony.cadences.length > 0) {
    educational_notes.push(`Cadences detected: ${harmony.cadences.join(', ')}`);
  }

  if (counterpoint.species_detected > 0) {
    educational_notes.push(`Counterpoint species: ${counterpoint.species_detected} (${getSpeciesName(counterpoint.species_detected)})`);
  }

  if (harmony.functional_analysis) {
    educational_notes.push(harmony.functional_analysis);
  }

  return {
    analysis: {
      key_center: key,
      scale_used: `${key} ${mode}`,
      chords_found,
      modulations: []
    },
    harmony,
    counterpoint,
    voice_leading,
    suggestions,
    educational_notes
  };
}

/**
 * Get species name
 */
function getSpeciesName(species: number): string {
  const names = ['First Species (Note against Note)', 'Second Species (Half Notes)', 'Third Species (Quarter Notes)', 'Fourth Species (Syncopation)', 'Fifth Species (Florid)'];
  return names[species - 1] || 'Unknown';
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {TheoristRequest, TheoristResponse, ChordAnalysis};
