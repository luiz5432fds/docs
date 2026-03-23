/**
 * SynKrony Arranger Agent
 *
 * Creates arrangements using Counterpoint - the art of combining
 * melodic lines according to the rules established by:
 * - Johann Joseph Fux (Gradus ad Parnassum)
 * - Guillaume Dufay (early counterpoint)
 * - Regional traditions (Brega, Forró)
 *
 * Implements species counterpoint with regional adaptations.
 */

import {NoteData, PartimentoRealization, SectionData, InstrumentData} from '../types';

// ============================================================================
// COUNTERPOINT ENGINE
// ============================================================================

interface ArrangerRequest {
  bass_line: NoteData[];
  key: string;
  mode: 'major' | 'minor';
  num_voices: number;        // 2-4 voices
  species: number;           // 1-5 (Fux species)
  genre?: 'brega' | 'forro' | 'tecnobrega' | 'classical';
  instrumentation?: InstrumentData[];
}

interface ArrangerResponse {
  realization: PartimentoRealization;
  sections: SectionData[];
  description: string;
  violations: string[];
  tips: string[];
}

/**
 * Interval names and qualities
 */
const INTERVALS = {
  unisson: {semitones: 0, perfect: true},
  minor2: {semitones: 1, perfect: false},
  major2: {semitones: 2, perfect: false},
  minor3: {semitones: 3, perfect: false},
  major3: {semitones: 4, perfect: false},
  perfect4: {semitones: 5, perfect: true},
  augmented4: {semitones: 6, perfect: false},
  diminished5: {semitones: 6, perfect: false},
  perfect5: {semitones: 7, perfect: true},
  minor6: {semitones: 8, perfect: false},
  major6: {semitones: 9, perfect: false},
  minor7: {semitones: 10, perfect: false},
  major7: {semitones: 11, perfect: false},
  octave: {semitones: 12, perfect: true},
};

/**
 * Consonant intervals (can be used on strong beats)
 */
const CONSONANT_INTERVALS = [
  0,   // Unison
  3, 4,  // Minor/Major third
  7,  // Perfect fifth
  9,  // Major sixth
  12, // Octave
];

/**
 * Dissonant intervals (require resolution)
 */
const DISSONANT_INTERVALS = [
  1, 2,  // Seconds
  5, 6,  // Fourth, augmented fourth
  8, 10, // Sixths (minor), minor seventh
  11,    // Major seventh
];

// ============================================================================
// COUNTERPOINT RULES
// ============================================================================

/**
 * Check for parallel fifths/octaves (forbidden in strict counterpoint)
 */
function checkParallelFifths(
  voice1: NoteData[],
  voice2: NoteData[]
): string[] {
  const violations: string[] = [];

  for (let i = 1; i < voice1.length && i < voice2.length; i++) {
    const prevInterval = Math.abs(voice1[i-1].pitch - voice2[i-1].pitch);
    const currInterval = Math.abs(voice1[i].pitch - voice2[i].pitch);

    // Check for parallel fifths
    if (prevInterval === 7 && currInterval === 7) {
      violations.push(`Parallel fifths at position ${voice1[i].position}`);
    }

    // Check for parallel octaves
    if (prevInterval === 12 && currInterval === 12) {
      violations.push(`Parallel octaves at position ${voice1[i].position}`);
    }
  }

  return violations;
}

/**
 * Check for direct fifths/octaves to perfect consonances
 */
function checkDirectMotion(
  voice1: NoteData[],
  voice2: NoteData[]
): string[] {
  const violations: string[] = [];

  for (let i = 1; i < voice1.length && i < voice2.length; i++) {
    const prevInterval = Math.abs(voice1[i-1].pitch - voice2[i-1].pitch);
    const currInterval = Math.abs(voice1[i].pitch - voice2[i].pitch);

    // Direct motion to perfect fifth or octave
    if ((currInterval === 7 || currInterval === 12) &&
        voice1[i].pitch > voice1[i-1].pitch &&
        voice2[i].pitch > voice2[i-1].pitch) {
      violations.push(`Direct motion to ${currInterval === 7 ? 'fifth' : 'octave'} at position ${voice1[i].position}`);
    }
  }

  return violations;
}

/**
 * Check if leading tone resolves properly
 */
function checkLeadingTone(
  voice: NoteData[],
  key: string,
  mode: 'major' | 'minor'
): string[] {
  const violations: string[] = [];
  const rootNote = noteNameToMidi(key);
  const leadingTone = mode === 'major' ? rootNote + 11 : rootNote + 10;
  const tonic = rootNote + 12;

  for (let i = 0; i < voice.length - 1; i++) {
    if (voice[i].pitch === leadingTone && voice[i+1].pitch !== tonic) {
      violations.push(`Leading tone does not resolve to tonic at position ${voice[i].position}`);
    }
  }

  return violations;
}

/**
 * Note name to MIDI conversion
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
// VOICE GENERATION
// ============================================================================

/**
 * Generate a counterpoint voice above the cantus firmus
 */
function generateCounterpointVoice(
  cantusFirmus: NoteData[],
  voiceIndex: number,
  species: number,
  key: string,
  mode: 'major' | 'minor',
  genre?: string
): NoteData[] {
  const voice: NoteData[] = [];
  const rootNote = noteNameToMidi(key);
  const scale = mode === 'major'
    ? [0, 2, 4, 5, 7, 9, 11]  // Major scale
    : [0, 2, 3, 5, 7, 8, 10]; // Minor scale

  for (let i = 0; i < cantusFirmus.length; i++) {
    const cfNote = cantusFirmus[i];
    const cfDegree = cfNote.partimento_degree ?? 0;

    let upperPitch: number;
    let velocity = cfNote.velocity - 10;  // Slightly softer

    switch (species) {
      case 1:  // Note against note
        upperPitch = generateFirstSpecies(cfNote.pitch, cfDegree, voiceIndex, scale, rootNote);
        break;

      case 2:  // Half notes against whole notes
        upperPitch = generateSecondSpecies(cfNote.pitch, cfDegree, voiceIndex, scale, rootNote, i % 2 === 0);
        break;

      case 3:  // Quarter notes against whole notes
        upperPitch = generateThirdSpecies(cfNote.pitch, cfDegree, voiceIndex, scale, rootNote);
        break;

      case 4:  // Syncopated (ligature)
        upperPitch = generateFourthSpecies(cfNote.pitch, cfDegree, voiceIndex, scale, rootNote);
        break;

      case 5:  // Florid counterpoint
      default:
        upperPitch = generateFloridSpecies(cfNote.pitch, cfDegree, voiceIndex, scale, rootNote);
        break;
    }

    // Regional adjustments
    if (genre === 'brega') {
      // Add upper register emphasis for emotional effect
      if (voiceIndex > 0) {
        upperPitch += 12;
      }
    } else if (genre === 'forro') {
      // Add syncopation
      if (i % 2 === 0 && voiceIndex > 0) {
        velocity = Math.max(80, velocity - 20);
      }
    }

    voice.push({
      id: `voice_${voiceIndex}_${i}`,
      pitch: upperPitch,
      duration: cfNote.duration,
      velocity: Math.max(60, velocity),
      position: cfNote.position,
      articulations: ['legato'],
    });
  }

  return voice;
}

/**
 * First species: one note against one note
 */
function generateFirstSpecies(
  cfPitch: number,
  cfDegree: number,
  voiceIndex: number,
  scale: number[],
  rootNote: number
): number {
  // Prefer consonant intervals: 3rd, 5th, 6th, octave
  const consonances = [3, 4, 7, 9, 12];

  // Find best consonance above the cantus firmus
  for (const interval of consonances) {
    const testPitch = cfPitch + interval;
    const degree = ((testPitch - rootNote) % 12 + 12) % 12;

    // Check if pitch is in scale
    if (scale.includes(degree)) {
      return testPitch;
    }
  }

  return cfPitch + 7;  // Default to fifth
}

/**
 * Second species: half notes against whole notes
 */
function generateSecondSpecies(
  cfPitch: number,
  cfDegree: number,
  voiceIndex: number,
  scale: number[],
  rootNote: number,
  onBeat: boolean
): number {
  if (onBeat) {
    // Strong beat: consonance
    return generateFirstSpecies(cfPitch, cfDegree, voiceIndex, scale, rootNote);
  } else {
    // Weak beat: can be dissonant (passing tone)
    const passingDegree = (cfDegree + 1) % 7;
    const passingPitch = rootNote + scale[passingDegree];
    return passingPitch + 12;
  }
}

/**
 * Third species: quarter notes against whole notes
 */
function generateThirdSpecies(
  cfPitch: number,
  cfDegree: number,
  voiceIndex: number,
  scale: number[],
  rootNote: number
): number {
  // Cambiata pattern: consonance - dissonance - consonance - consonance
  const consonance = generateFirstSpecies(cfPitch, cfDegree, voiceIndex, scale, rootNote);
  const passingDegree = (cfDegree + 2) % 7;
  return rootNote + scale[passingDegree] + 12;
}

/**
 * Fourth species: syncopated (ligature)
 */
function generateFourthSpecies(
  cfPitch: number,
  cfDegree: number,
  voiceIndex: number,
  scale: number[],
  rootNote: number
): number {
  // Suspension preparation
  const consonance = generateFirstSpecies(cfPitch, cfDegree, voiceIndex, scale, rootNote);
  return consonance;  // Will be tied to next note
}

/**
 * Fifth species: florid (mixed)
 */
function generateFloridSpecies(
  cfPitch: number,
  cfDegree: number,
  voiceIndex: number,
  scale: number[],
  rootNote: number
): number {
  // Mix of all species
  const patterns = [
    () => generateFirstSpecies(cfPitch, cfDegree, voiceIndex, scale, rootNote),
    () => generateSecondSpecies(cfPitch, cfDegree, voiceIndex, scale, rootNote, false),
    () => generateThirdSpecies(cfPitch, cfDegree, voiceIndex, scale, rootNote),
  ];

  return patterns[Math.floor(Math.random() * patterns.length)]();
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

export async function arrangerAgent(request: ArrangerRequest): Promise<ArrangerResponse> {
  const {
    bass_line,
    key,
    mode,
    num_voices,
    species,
    genre = 'classical',
    instrumentation
  } = request;

  // Validate inputs
  const safeNumVoices = Math.max(2, Math.min(4, num_voices));
  const safeSpecies = Math.max(1, Math.min(5, species));

  // Generate counterpoint voices
  const counterpoint_voices: NoteData[][] = [];

  for (let v = 0; v < safeNumVoices - 1; v++) {
    const voice = generateCounterpointVoice(
      bass_line,
      v + 1,
      safeSpecies,
      key,
      mode,
      genre
    );
    counterpoint_voices.push(voice);
  }

  // Create harmonic progression from bass line
  const harmonic_progression = bass_line.map(note => {
    const degree = note.partimento_degree ?? 0;
    const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viio'];
    return romanNumerals[degree] || 'I';
  });

  // Check for violations
  const violations: string[] = [];

  for (let v = 0; v < counterpoint_voices.length - 1; v++) {
    const voice1 = counterpoint_voices[v];
    const voice2 = counterpoint_voices[v + 1];

    // Skip checks for regional genres that allow more freedom
    if (genre !== 'brega' && genre !== 'forro') {
      violations.push(...checkParallelFifths(voice1, voice2));
      violations.push(...checkDirectMotion(voice1, voice2));
    }

    violations.push(...checkLeadingTone(voice1, key, mode));
  }

  // Create default sections if not provided
  const sections: SectionData[] = [
    {
      id: 'section_main',
      name: genre === 'brega' ? 'Verso' : genre === 'forro' ? 'A' : 'Exposition',
      bars: {start: 1, end: Math.ceil(bass_line.length / 4)},
      instruments: instrumentation?.map(i => i.instrumentId) || ['inst_piano', 'inst_violin'],
      dynamics: 'mf',
    }
  ];

  // Generate description
  const description = `Contraponto ${species === 1 ? 'Primeira Espécie' : species === 2 ? 'Segunda Espécie' : species === 3 ? 'Terceira Espécie' : species === 4 ? 'Quarta Espécie' : 'Florido'}
  - Vozes: ${safeNumVoices}
  - Modo: ${key} ${mode === 'major' ? 'Maior' : 'Menor'}
  - Estilo: ${genre}
  - Regras aplicadas: Fux ${species}ª espécie${genre === 'brega' ? ' (adaptado para Brega)' : ''}`;

  // Generate tips
  const tips: string[] = [];
  if (violations.length === 0) {
    tips.push('Contraponto limpo - sem violações das regras estritas.');
  } else {
    tips.push(`Encontradas ${violations.length} possíveis violações.`);
  }

  if (genre === 'brega') {
    tips.push('Brega permite liberdade harmônica - focar na emoção.');
    tips.push('Usar suspensions para efeito dramático.');
  } else if (genre === 'forro') {
    tips.push('Forró beneficia de sincopação sutil nas vozes superiores.');
    tips.push('Mantém o groove rítmico característico.');
  }

  return {
    realization: {
      bass_line,
      harmonic_progression,
      counterpoint_voices,
    },
    sections,
    description,
    violations,
    tips,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {ArrangerRequest, ArrangerResponse};
