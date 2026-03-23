import * as admin from 'firebase-admin';
import {
  MusicScale,
  MusicChord,
  MusicProgression,
  MusicInstrument,
  PartimentoRuleDoc,
  CounterpointRuleDoc,
  GenreTemplate,
  Voicing,
  PartimentoRule,
  CounterpointRule,
} from '../types';

const db = admin.firestore();

// ============================================================================
// SCALES DATA
// ============================================================================

const scalesData: MusicScale[] = [
  // Major scales (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `major_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Maior',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Major'
    },
    root,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major',
    tags: ['diatônica', 'maior', 'tonal'],
    chords: [
      `major_triad_${root}`,
      `minor_triad_${(root + 2) % 12}`,
      `minor_triad_${(root + 4) % 12}`,
      `major_triad_${(root + 5) % 12}`,
      `major_triad_${(root + 7) % 12}`,
      `minor_triad_${(root + 9) % 12}`,
      `dim_triad_${(root + 11) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Minor scales (Natural/Relative) (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `minor_natural_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Menor Natural',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Natural Minor'
    },
    root,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor',
    tags: ['diatônica', 'menor', 'tonal', 'eólio'],
    chords: [
      `minor_triad_${root}`,
      `dim_triad_${(root + 2) % 12}`,
      `major_triad_${(root + 3) % 12}`,
      `minor_triad_${(root + 5) % 12}`,
      `minor_triad_${(root + 7) % 12}`,
      `major_triad_${(root + 8) % 12}`,
      `major_triad_${(root + 10) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Harmonic Minor
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `minor_harmonic_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Menor Harmônica',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Harmonic Minor'
    },
    root,
    intervals: [0, 2, 3, 5, 7, 8, 11],
    type: 'minor',
    tags: ['diatônica', 'menor', 'tonal', 'harmônica', 'dominante'],
    chords: [
      `minor_triad_${root}`,
      `dim_triad_${(root + 2) % 12}`,
      `aug_triad_${(root + 3) % 12}`,
      `minor_triad_${(root + 5) % 12}`,
      `major_triad_${(root + 7) % 12}`,
      `major_triad_${(root + 8) % 12}`,
      `dim_triad_${(root + 11) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Pentatonic Major
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `pentatonic_major_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Pentatônica Maior',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Pentatonic Major'
    },
    root,
    intervals: [0, 2, 4, 7, 9],
    type: 'pentatonic',
    tags: ['pentatônica', 'maior', 'popular'],
    chords: [
      `major_triad_${root}`,
      `major_triad_${(root + 4) % 12}`,
      `sus2_triad_${(root + 7) % 12}`,
      `major_triad_${(root + 9) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Pentatonic Minor
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `pentatonic_minor_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Pentatônica Menor',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Pentatonic Minor'
    },
    root,
    intervals: [0, 3, 5, 7, 10],
    type: 'pentatonic',
    tags: ['pentatônica', 'menor', 'blues', 'popular'],
    chords: [
      `minor_triad_${root}`,
      `minor_triad_${(root + 5) % 12}`,
      `minor_triad_${(root + 7) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Blues Scale
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `blues_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Blues',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Blues'
    },
    root,
    intervals: [0, 3, 5, 6, 7, 10],
    type: 'blues',
    tags: ['blues', 'blue note', 'pentatônica'],
    chords: [
      `dom7_${root}`,
      `dom7_${(root + 5) % 12}`,
      `dom7_${(root + 7) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Brega Scale (adapted for romantic brega)
  ...[0, 2, 5, 7, 9].map(root => ({
    id: `brega_${root}`,
    name: {
      pt: ['C', 'D', 'F', 'G', 'A'][root === 0 ? 0 : root === 2 ? 1 : root === 5 ? 2 : root === 7 ? 3 : 4] + ' Brega',
      en: ['C', 'D', 'F', 'G', 'A'][root === 0 ? 0 : root === 2 ? 1 : root === 5 ? 2 : root === 7 ? 3 : 4] + ' Brega'
    },
    root,
    intervals: [0, 2, 4, 5, 7, 9], // Major with emphasis on 2nd and 6th
    type: 'brega',
    tags: ['brega', 'romântico', 'nordestino', 'emocional'],
    chords: [
      `major_triad_${root}`,
      `dom7_${(root + 5) % 12}`,
      `major_triad_${(root + 7) % 12}`,
      `dom7_${root}`
    ],
    partimento_rules: [],
    regional_style: 'brega'
  })),

  // Forró Scale (adapted for forró pé de serra)
  ...[0, 2, 5, 7].map(root => ({
    id: `forro_${root}`,
    name: {
      pt: ['C', 'D', 'F', 'G'][root === 0 ? 0 : root === 2 ? 1 : root === 5 ? 2 : 3] + ' Forró',
      en: ['C', 'D', 'F', 'G'][root === 0 ? 0 : root === 2 ? 1 : root === 5 ? 2 : 3] + ' Forro'
    },
    root,
    intervals: [0, 2, 4, 5, 7], // Major pentatonic with emphasis
    type: 'forro',
    tags: ['forró', 'pé de serra', 'nordestino', 'baião'],
    chords: [
      `major_triad_${root}`,
      `major_triad_${(root + 2) % 12}`,
      `dom7_${(root + 7) % 12}`,
      `major_triad_${(root + 9) % 12}`
    ],
    partimento_rules: [],
    regional_style: 'forro'
  })),

  // Dorian mode
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `dorian_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Dórico',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Dorian'
    },
    root,
    intervals: [0, 2, 3, 5, 7, 9, 10],
    type: 'modal',
    tags: ['modal', 'dórico', 'jazz', 'improvisação'],
    chords: [
      `minor_triad_${root}`,
      `minor_triad_${(root + 2) % 12}`,
      `major_triad_${(root + 3) % 12}`,
      `dom7_${(root + 5) % 12}`,
      `minor_triad_${(root + 7) % 12}`,
      `dim_triad_${(root + 9) % 12}`,
      `major_triad_${(root + 10) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Mixolydian mode
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `mixolydian_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Mixolídio',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Mixolydian'
    },
    root,
    intervals: [0, 2, 4, 5, 7, 9, 10],
    type: 'modal',
    tags: ['modal', 'mixolídio', 'dominante', 'rock', 'blues'],
    chords: [
      `major_triad_${root}`,
      `minor_triad_${(root + 2) % 12}`,
      `dim_triad_${(root + 4) % 12}`,
      `major_triad_${(root + 5) % 12}`,
      `minor_triad_${(root + 7) % 12}`,
      `major_triad_${(root + 9) % 12}`,
      `minor_triad_${(root + 10) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Phrygian mode
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `phrygian_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Frígio',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Phrygian'
    },
    root,
    intervals: [0, 1, 3, 5, 7, 8, 10],
    type: 'modal',
    tags: ['modal', 'frígio', 'flamenco', 'árabe'],
    chords: [
      `minor_triad_${root}`,
      `major_triad_${(root + 1) % 12}`,
      `major_triad_${(root + 3) % 12}`,
      `minor_triad_${(root + 5) % 12}`,
      `dim_triad_${(root + 7) % 12}`,
      `major_triad_${(root + 8) % 12}`,
      `minor_triad_${(root + 10) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  })),

  // Lydian mode
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `lydian_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Lídio',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Lydian'
    },
    root,
    intervals: [0, 2, 4, 6, 7, 9, 11],
    type: 'modal',
    tags: ['modal', 'lídio', 'dreamy', 'floaty'],
    chords: [
      `major_triad_${root}`,
      `major_triad_${(root + 2) % 12}`,
      `dim_triad_${(root + 4) % 12}`,
      `major_triad_${(root + 6) % 12}`,
      `minor_triad_${(root + 7) % 12}`,
      `minor_triad_${(root + 9) % 12}`,
      `major_triad_${(root + 11) % 12}`
    ],
    partimento_rules: [],
    regional_style: undefined
  }))
];

// ============================================================================
// CHORDS DATA
// ============================================================================

const createVoicing = (name: string, notes: number[], style: string): Voicing => ({
  name,
  notes,
  style,
  regional_style: undefined
});

const chordsData: MusicChord[] = [
  // Major Triads (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `major_triad_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] ' Maior',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] ' Major'
    },
    symbols: ['', 'M', 'maj', 'Δ'],
    root,
    intervals: [0, 4, 7],
    type: 'triad',
    function: ['I', 'IV', 'V'].includes(String(root)) ? String(root) : undefined,
    scales: [`major_${root}`, `mixolydian_${root}`, `lydian_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 4, 7], 'fechado'),
      createVoicing('1st Inversion', [4, 7, 12], 'fechado'),
      createVoicing('2nd Inversion', [7, 12, 16], 'fechado'),
      createVoicing('Drop 2', [12, 7, 16, 5], 'drop2'),
      createVoicing('Brega Style', [0, 12, 7, 16], 'aberto')
    ],
    counterpoint_rules: []
  })),

  // Minor Triads (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `minor_triad_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Menor',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Minor'
    },
    symbols: ['m', 'min', '-'],
    root,
    intervals: [0, 3, 7],
    type: 'triad',
    function: ['ii', 'iii', 'vi'].includes(String(root)) ? String(root) : undefined,
    scales: [`minor_natural_${root}`, `dorian_${root}`, `phrygian_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 3, 7], 'fechado'),
      createVoicing('1st Inversion', [3, 7, 12], 'fechado'),
      createVoicing('2nd Inversion', [7, 12, 15], 'fechado'),
      createVoicing('Drop 2', [12, 7, 15, 3], 'drop2'),
      createVoicing('Forró Style', [0, 12, 7, 15], 'aberto')
    ],
    counterpoint_rules: []
  })),

  // Dominant 7th (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `dom7_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Dominante 7',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Dominant 7th'
    },
    symbols: ['7', 'dom7'],
    root,
    intervals: [0, 4, 7, 10],
    type: 'seventh',
    function: 'V7',
    scales: [`mixolydian_${root}`, `blues_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 4, 7, 10], 'fechado'),
      createVoicing('3rd Inversion', [10, 12, 16, 19], 'fechado'),
      createVoicing('Drop 2', [12, 10, 19, 5], 'drop2'),
      createVoicing('Shell', [0, 10], 'shell'),
      createVoicing('Brega 3-7', [0, 7, 10, 14], 'aberto'),
      createVoicing('Forró Baixo', [0, 7, 10, 12], 'aberto')
    ],
    counterpoint_rules: []
  })),

  // Major 7th (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `maj7_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Maior 7',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Major 7th'
    },
    symbols: ['maj7', 'Δ7', 'M7'],
    root,
    intervals: [0, 4, 7, 11],
    type: 'seventh',
    function: 'Imaj7',
    scales: [`major_${root}`, `lydian_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 4, 7, 11], 'fechado'),
      createVoicing('Drop 2', [12, 11, 19, 5], 'drop2'),
      createVoicing('Rootless', [11, 14, 19], 'rootless'),
      createVoicing('Brega Suave', [0, 11, 7, 14], 'aberto')
    ],
    counterpoint_rules: []
  })),

  // Minor 7th (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `min7_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Menor 7',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Minor 7th'
    },
    symbols: ['m7', 'min7', '-7'],
    root,
    intervals: [0, 3, 7, 10],
    type: 'seventh',
    function: 'ii7',
    scales: [`dorian_${root}`, `minor_natural_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 3, 7, 10], 'fechado'),
      createVoicing('Drop 2', [12, 10, 15, 3], 'drop2'),
      createVoicing('Rootless', [10, 15, 17], 'rootless'),
      createVoicing('Forró Acorde', [0, 10, 7, 12], 'aberto')
    ],
    counterpoint_rules: []
  })),

  // Diminished Triads (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `dim_triad_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Diminuto',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Diminished'
    },
    symbols: ['dim', '°'],
    root,
    intervals: [0, 3, 6],
    type: 'triad',
    function: 'viio',
    scales: [`minor_harmonic_${(root - 1 + 12) % 12}`],
    voicings: [
      createVoicing('Root Position', [0, 3, 6], 'fechado'),
      createVoicing('1st Inversion', [3, 6, 12], 'fechado')
    ],
    counterpoint_rules: []
  })),

  // Augmented Triads (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `aug_triad_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Aumentado',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Augmented'
    },
    symbols: ['aug', '+', '+5'],
    root,
    intervals: [0, 4, 8],
    type: 'triad',
    function: 'III+',
    scales: [`minor_harmonic_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 4, 8], 'fechado'),
      createVoicing('1st Inversion', [4, 8, 12], 'fechado')
    ],
    counterpoint_rules: []
  })),

  // SUS2 (12 roots)
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(root => ({
    id: `sus2_triad_${root}`,
    name: {
      pt: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Sus2',
      en: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][root] + ' Sus2'
    },
    symbols: ['sus2', 'sus2'],
    root,
    intervals: [0, 2, 7],
    type: 'triad',
    function: undefined,
    scales: [`major_${root}`],
    voicings: [
      createVoicing('Root Position', [0, 2, 7], 'fechado'),
      createVoicing('Forró Zabumba', [0, 7, 14, 2], 'aberto')
    ],
    counterpoint_rules: []
  }))
];

// ============================================================================
// PROGRESSIONS DATA
// ============================================================================

const progressionsData: MusicProgression[] = [
  {
    id: 'ii_v_i',
    name: {pt: 'ii-V-I', en: 'ii-V-I'},
    chords: ['ii7', 'V7', 'Imaj7'],
    category: 'jazz',
    description: {
      pt: 'Progressão clássica de cadência perfeita em jazz',
      en: 'Classic perfect cadence progression in jazz'
    },
    commonKeys: ['C Major', 'F Major', 'Bb Major'],
    variations: ['ii-V-I-vi', 'iii-vi-ii-V-I'],
    partimento_schema: 'Rule_of_Octave'
  },
  {
    id: 'i_vi_iv_v',
    name: {pt: 'I-vi-IV-V', en: 'I-vi-IV-V'},
    chords: ['I', 'vi', 'IV', 'V7'],
    category: 'pop',
    description: {
      pt: 'Progressão "50s" muito usada em pop e rock',
      en: 'Classic "50s" progression used in pop and rock'
    },
    commonKeys: ['C Major', 'G Major', 'D Major'],
    variations: ['I-V-vi-IV', 'vi-IV-I-V'],
    partimento_schema: 'Rule_of_Octave_Modified'
  },
  {
    id: 'i_iv_v',
    name: {pt: 'I-IV-V', en: 'I-IV-V'},
    chords: ['I', 'IV', 'V7'],
    category: 'blues',
    description: {
      pt: 'Progressão básica de blues e rock',
      en: 'Basic blues and rock progression'
    },
    commonKeys: ['C Major', 'G Major', 'E Major'],
    variations: ['I-IV-I-V', 'I-IV-IV-V'],
    partimento_schema: 'Rule_of_Octave'
  },
  {
    id: 'brega_romantico',
    name: {pt: 'Brega Romântico', en: 'Brega Romántico'},
    chords: ['I', 'V7/vi', 'vi', 'IV', 'V7'],
    category: 'brega',
    description: {
      pt: 'Progressão emocional típica do brega romântico',
      en: 'Emotional progression typical of romantic brega'
    },
    commonKeys: ['C Major', 'G Major'],
    variations: ['I-vi-IV-V', 'I-III-vi-IV'],
    partimento_schema: 'Brega_Romantic'
  },
  {
    id: 'forro_baiao',
    name: {pt: 'Forró Baião', en: 'Forró Baião'},
    chords: ['I', 'IV', 'I', 'V7'],
    category: 'forro',
    description: {
      pt: 'Progressão tradicional de baião',
      en: 'Traditional baião progression'
    },
    commonKeys: ['C Major', 'G Major', 'F Major'],
    variations: ['I-IV-I-V', 'I-V7-I-IV'],
    partimento_schema: 'Forro_Baiao'
  },
  {
    id: 'tecnobrega',
    name: {pt: 'Tecnobrega', en: 'Tecnobrega'},
    chords: ['i', 'VI', 'III', 'VII'],
    category: 'tecnobrega',
    description: {
      pt: 'Progressão eletrônica do tecnobrega paraense',
      en: 'Electronic progression of Pará tecnobrega'
    },
    commonKeys: ['A Minor', 'E Minor'],
    variations: ['i-VII-VI-V', 'i-III-VII-i'],
    partimento_schema: 'Tecnobrega'
  },
  {
    id: 'circle_of_fifths',
    name: {pt: 'Círculo de Quintas', en: 'Circle of Fifths'},
    chords: ['I', 'IV', 'vii', 'iii', 'vi', 'ii', 'V7', 'I'],
    category: 'jazz',
    description: {
      pt: 'Progressão completa pelo círculo de quintas',
      en: 'Full circle of fifths progression'
    },
    commonKeys: ['C Major'],
    variations: ['iii-vi-ii-V-I', 'ii-V-I-IV'],
    partimento_schema: 'Rule_of_Octave'
  },
  {
    id: 'andalusian_cadence',
    name: {pt: 'Cadência Andaluz', en: 'Andalusian Cadence'},
    chords: ['i', 'VII', 'VI', 'V'],
    category: 'classical',
    description: {
      pt: 'Cadência frígia usada no flamenco',
      en: 'Phrygian cadence used in flamenco'
    },
    commonKeys: ['A Minor', 'E Minor'],
    variations: ['i-VII-V', 'i-VI-V'],
    partimento_schema: 'Phrygian_Cadence'
  }
];

// ============================================================================
// INSTRUMENTS DATA
// ============================================================================

const instrumentsData: MusicInstrument[] = [
  // Woodwinds
  {
    id: 'flute',
    name: {pt: 'Flauta', en: 'Flute'},
    family: 'woodwinds',
    range: {lowest: 60, highest: 96, practical: {lowest: 64, highest: 93}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 73,
    articulations: ['staccato', 'legato', 'trill', 'flutter_tongue', 'vibrato'],
    dynamics: {pp: 20, ff: 110},
    commonIn: ['orchestra', 'concert_band', 'forro'],
    xps10Category: 'wind',
    regional_role: 'melodia_forro'
  },
  {
    id: 'clarinet',
    name: {pt: 'Clarinete', en: 'Clarinet'},
    family: 'woodwinds',
    range: {lowest: 50, highest: 92, practical: {lowest: 53, highest: 89}},
    transposition: -2,
    clef: 'treble',
    midiProgram: 71,
    articulations: ['staccato', 'legato', 'slap', 'growl'],
    dynamics: {pp: 15, ff: 115},
    commonIn: ['orchestra', 'concert_band', 'klezmer', 'brega'],
    xps10Category: 'wind',
    regional_role: 'solo_brega'
  },
  {
    id: 'saxophone',
    name: {pt: 'Saxofone', en: 'Saxophone'},
    family: 'woodwinds',
    range: {lowest: 47, highest: 84, practical: {lowest: 50, highest: 81}},
    transposition: -9,
    clef: 'treble',
    midiProgram: 65,
    articulations: ['staccato', 'legato', 'growl', 'flutter', 'bends'],
    dynamics: {pp: 20, ff: 120},
    commonIn: ['jazz', 'pop', 'brega', 'forro'],
    xps10Category: 'wind',
    regional_role: 'solo_brega'
  },
  // Brass
  {
    id: 'trumpet',
    name: {pt: 'Trompete', en: 'Trumpet'},
    family: 'brass',
    range: {lowest: 58, highest: 94, practical: {lowest: 60, highest: 91}},
    transposition: -2,
    clef: 'treble',
    midiProgram: 56,
    articulations: ['staccato', 'legato', 'mute', 'falls', 'doits'],
    dynamics: {pp: 30, ff: 120},
    commonIn: ['orchestra', 'jazz', 'brega', 'forro'],
    xps10Category: 'brass',
    regional_role: 'solo_brega'
  },
  {
    id: 'trombone',
    name: {pt: 'Trombone', en: 'Trombone'},
    family: 'brass',
    range: {lowest: 34, highest: 76, practical: {lowest: 40, highest: 72}},
    transposition: 0,
    clef: 'bass',
    midiProgram: 57,
    articulations: ['staccato', 'legato', 'mute', 'glissando'],
    dynamics: {pp: 25, ff: 115},
    commonIn: ['orchestra', 'jazz', 'brega'],
    xps10Category: 'brass',
    regional_role: 'base_harmonica'
  },
  {
    id: 'tuba',
    name: {pt: 'Tuba', en: 'Tuba'},
    family: 'brass',
    range: {lowest: 28, highest: 64, practical: {lowest: 30, highest: 58}},
    transposition: 0,
    clef: 'bass',
    midiProgram: 58,
    articulations: ['staccato', 'legato'],
    dynamics: {pp: 35, ff: 110},
    commonIn: ['orchestra', 'concert_band', 'forro'],
    xps10Category: 'brass',
    regional_role: 'baixo_forro'
  },
  // Strings
  {
    id: 'violin',
    name: {pt: 'Violino', en: 'Violin'},
    family: 'strings',
    range: {lowest: 55, highest: 117, practical: {lowest: 60, highest: 108}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 40,
    articulations: ['staccato', 'legato', 'pizzicato', 'tremolo', 'vibrato', 'sul_ponticello'],
    dynamics: {pp: 10, ff: 115},
    commonIn: ['orchestra', 'brega', 'forro'],
    xps10Category: 'strings',
    regional_role: 'melodia_brega'
  },
  {
    id: 'viola',
    name: {pt: 'Viola', en: 'Viola'},
    family: 'strings',
    range: {lowest: 48, highest: 100, practical: {lowest: 52, highest: 93}},
    transposition: 0,
    clef: 'alto',
    midiProgram: 41,
    articulations: ['staccato', 'legato', 'pizzicato', 'tremolo'],
    dynamics: {pp: 10, ff: 110},
    commonIn: ['orchestra'],
    xps10Category: 'strings',
    regional_role: undefined
  },
  {
    id: 'cello',
    name: {pt: 'Violoncelo', en: 'Cello'},
    family: 'strings',
    range: {lowest: 36, highest: 76, practical: {lowest: 40, highest: 72}},
    transposition: 0,
    clef: 'bass',
    midiProgram: 42,
    articulations: ['staccato', 'legato', 'pizzicato', 'tremolo', 'vibrato'],
    dynamics: {pp: 15, ff: 110},
    commonIn: ['orchestra', 'brega'],
    xps10Category: 'strings',
    regional_role: 'base_harmonica'
  },
  {
    id: 'double_bass',
    name: {pt: 'Contrabaixo', en: 'Double Bass'},
    family: 'strings',
    range: {lowest: 28, highest: 67, practical: {lowest: 28, highest: 60}},
    transposition: 0,
    clef: 'bass',
    midiProgram: 43,
    articulations: ['staccato', 'legato', 'pizzicato'],
    dynamics: {pp: 20, ff: 100},
    commonIn: ['orchestra', 'jazz', 'brega', 'forro'],
    xps10Category: 'strings',
    regional_role: 'baixo_forro'
  },
  // Percussion (Regional)
  {
    id: 'zabumba',
    name: {pt: 'Zabumba', en: 'Zabumba'},
    family: 'percussion',
    range: {lowest: 36, highest: 50, practical: {lowest: 36, highest: 48}},
    transposition: 0,
    clef: 'percussion',
    midiProgram: 0,
    articulations: ['hit', 'rim', 'mute'],
    dynamics: {pp: 40, ff: 120},
    commonIn: ['forro', 'baião'],
    xps10Category: 'drums',
    regional_role: 'baixo_forro'
  },
  {
    id: 'triangulo',
    name: {pt: 'Triângulo', en: 'Triangle'},
    family: 'percussion',
    range: {lowest: 84, highest: 88, practical: {lowest: 84, highest: 88}},
    transposition: 0,
    clef: 'percussion',
    midiProgram: 0,
    articulations: ['hit', 'mute', 'roll'],
    dynamics: {pp: 50, ff: 110},
    commonIn: ['forro', 'baião'],
    xps10Category: 'percussion',
    regional_role: 'ritmo_forro'
  },
  {
    id: 'pifano',
    name: {pt: 'Pífano', en: 'Pífano'},
    family: 'woodwinds',
    range: {lowest: 72, highest: 96, practical: {lowest: 72, highest: 93}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 74,
    articulations: ['staccato', 'legato', 'trill', 'vibrato'],
    dynamics: {pp: 40, ff: 115},
    commonIn: ['forro', 'banda_de_pífano'],
    xps10Category: 'wind',
    regional_role: 'melodia_forro'
  },
  // Keyboards
  {
    id: 'piano',
    name: {pt: 'Piano', en: 'Piano'},
    family: 'keyboard',
    range: {lowest: 21, highest: 108, practical: {lowest: 28, highest: 100}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 0,
    articulations: ['staccato', 'legato', 'tenuto', 'accent'],
    dynamics: {pp: 5, ff: 120},
    commonIn: ['all'],
    xps10Category: 'piano',
    regional_role: 'teclado_brega'
  },
  {
    id: 'accordion',
    name: {pt: 'Acordeão', en: 'Accordion'},
    family: 'keyboard',
    range: {lowest: 36, highest: 84, practical: {lowest: 40, highest: 77}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 21,
    articulations: ['staccato', 'legato', 'bellows'],
    dynamics: {pp: 20, ff: 110},
    commonIn: ['forro', 'brega', 'sertanejo'],
    xps10Category: 'organ',
    regional_role: 'teclado_brega'
  },
  // Synth
  {
    id: 'synth_lead',
    name: {pt: 'Synth Lead', en: 'Synth Lead'},
    family: 'synth',
    range: {lowest: 36, highest: 96, practical: {lowest: 48, highest: 84}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 80,
    articulations: ['staccato', 'legato', 'portamento', 'vibrato'],
    dynamics: {pp: 30, ff: 120},
    commonIn: ['electronic', 'pop', 'tecnobrega'],
    xps10Category: 'synth',
    regional_role: 'solo_brega'
  },
  {
    id: 'synth_pad',
    name: {pt: 'Synth Pad', en: 'Synth Pad'},
    family: 'synth',
    range: {lowest: 36, highest: 84, practical: {lowest: 48, highest: 77}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 89,
    articulations: ['legato', 'swell'],
    dynamics: {pp: 25, ff: 110},
    commonIn: ['electronic', 'ambient', 'brega'],
    xps10Category: 'synth',
    regional_role: 'harmonia_brega'
  },
  {
    id: 'synth_bass',
    name: {pt: 'Synth Bass', en: 'Synth Bass'},
    family: 'synth',
    range: {lowest: 24, highest: 60, practical: {lowest: 28, highest: 55}},
    transposition: 0,
    clef: 'bass',
    midiProgram: 87,
    articulations: ['staccato', 'legato', 'slide'],
    dynamics: {pp: 35, ff: 115},
    commonIn: ['electronic', 'funk', 'tecnobrega'],
    xps10Category: 'synth',
    regional_role: 'baixo_tecnobrega'
  },
  // Vocal
  {
    id: 'male_voice',
    name: {pt: 'Voz Masculina', en: 'Male Voice'},
    family: 'vocal',
    range: {lowest: 41, highest: 74, practical: {lowest: 48, highest: 69}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 0,
    articulations: ['staccato', 'legato', 'vibrato', 'breath'],
    dynamics: {pp: 30, ff: 100},
    commonIn: ['all'],
    xps10Category: undefined,
    regional_role: undefined
  },
  {
    id: 'female_voice',
    name: {pt: 'Voz Feminina', en: 'Female Voice'},
    family: 'vocal',
    range: {lowest: 55, highest: 88, practical: {lowest: 60, highest: 84}},
    transposition: 0,
    clef: 'treble',
    midiProgram: 0,
    articulations: ['staccato', 'legato', 'vibrato', 'breath'],
    dynamics: {pp: 30, ff: 100},
    commonIn: ['all'],
    xps10Category: undefined,
    regional_role: undefined
  }
];

// ============================================================================
// PARTIMENTO RULES DATA
// ============================================================================

const partimentoRulesData: PartimentoRuleDoc[] = [
  // Rule of the Octave (Dufay/Fenaroli)
  {
    id: 'rule_of_octave_1',
    name: 'Regra da Oitava - Grau I',
    description: {
      pt: 'Baixo no grau I: harmonizar com acorde tônico em posição fundamental',
      en: 'Bass on degree I: harmonize with tonic chord in root position'
    },
    source: 'dufay',
    bass_degree: 0,
    voicing: [0, 4, 7], // Root, 3rd, 5th
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'Adicionar 9a (décima segunda) para colorido emocional',
      practice_note: 'No brega romântico, a 9a menor adiciona melancolia'
    }
  },
  {
    id: 'rule_of_octave_2',
    name: 'Regra da Oitava - Grau II',
    description: {
      pt: 'Baixo no grau II: harmonizar com acorde subdominante ou primeiro inversión',
      en: 'Bass on degree II: harmonize with subdominant chord or first inversion'
    },
    source: 'fenaroli',
    bass_degree: 1,
    voicing: [0, 3, 7], // Minor triad (ii)
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'forro',
      modification: 'Usar voicing 0-7-12 (quinta e oitava) para clareza rítmica',
      practice_note: 'No forró, a terceira menor pode ser omitida para destaque do zabumba'
    }
  },
  {
    id: 'rule_of_octave_3',
    name: 'Regra da Oitava - Grau III',
    description: {
      pt: 'Baixo no grau III: harmonizar com acorde mediantes',
      en: 'Bass on degree III: harmonize with mediant chord'
    },
    source: 'dufay',
    bass_degree: 2,
    voicing: [0, 4, 7], // Major triad (III)
    forbidden_intervals: [6], // Avoid diminished 5th
    regional_adaptation: undefined
  },
  {
    id: 'rule_of_octave_4',
    name: 'Regra da Oitava - Grau IV',
    description: {
      pt: 'Baixo no grau IV: harmonizar com acorde subdominante',
      en: 'Bass on degree IV: harmonize with subdominant chord'
    },
    source: 'fenaroli',
    bass_degree: 3,
    voicing: [0, 4, 7], // Major triad (IV)
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'Adicionar sexta (IV6) para transições suaves',
      practice_note: 'IV6 é muito usado no brega para criar tensão romântica'
    }
  },
  {
    id: 'rule_of_octave_5',
    name: 'Regra da Oitava - Grau V',
    description: {
      pt: 'Baixo no grau V: harmonizar com acorde dominante (com sétima)',
      en: 'Bass on degree V: harmonize with dominant chord (with seventh)'
    },
    source: 'dufay',
    bass_degree: 4,
    voicing: [0, 4, 7, 10], // Dominant 7th
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'forro',
      modification: 'Omitir a terça para maior estabilidade rítmica',
      practice_note: 'V7 sem terça (shell 1-7) é típico do forró pé de serra'
    }
  },
  {
    id: 'rule_of_octave_6',
    name: 'Regra da Oitava - Grau VI',
    description: {
      pt: 'Baixo no grau VI: harmonizar com acorde relativo menor',
      en: 'Bass on degree VI: harmonize with relative minor chord'
    },
    source: 'fenaroli',
    bass_degree: 5,
    voicing: [0, 3, 7], // Minor triad (vi)
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'Vi pode ser substituído por VI7 para emoção intensa',
      practice_note: 'VI7 é usado em clímax emocionais do brega'
    }
  },
  {
    id: 'rule_of_octave_7',
    name: 'Regra da Oitava - Grau VII',
    description: {
      pt: 'Baixo no grau VII: harmonizar com acorde sensível (diminuto)',
      en: 'Bass on degree VII: harmonize with leading tone chord (diminished)'
    },
    source: 'dufay',
    bass_degree: 6,
    voicing: [0, 3, 6], // Diminished triad
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'forro',
      modification: 'VII pode ser substituído por V7/IV',
      practice_note: 'No forró, V7/IV é mais comum que o diminuto'
    }
  },
  // Cadence rules
  {
    id: 'authentic_cadence',
    name: 'Cadência Autêntica',
    description: {
      pt: 'V-I: movimento conclusivo clássico',
      en: 'V-I: classic conclusive motion'
    },
    source: 'dufay',
    bass_degree: 4,
    voicing: [0, 4, 7, 10], // V7
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'Adicionar retardos 4-3 e 9-8 para expressividade',
      practice_note: 'Retardos são essenciais no fraseado brega'
    }
  },
  {
    id: 'plagal_cadence',
    name: 'Cadência Plagal',
    description: {
      pt: 'IV-I: movimento conclusivo "amém"',
      en: 'IV-I: "Amen" conclusive motion'
    },
    source: 'fenaroli',
    bass_degree: 3,
    voicing: [0, 4, 7], // IV
    forbidden_intervals: [],
    regional_adaptation: undefined
  },
  {
    id: 'deceptive_cadence',
    name: 'Cadência Deceptiva',
    description: {
      pt: 'V-vi: movimento surpreendente',
      en: 'V-vi: surprising motion'
    },
    source: 'dufay',
    bass_degree: 4,
    voicing: [0, 4, 7, 10], // V7
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'V-VI (maior) pode ser usado no brega',
      practice_note: 'A deceptiva no brega cria tensão para o refrão'
    }
  }
];

// ============================================================================
// COUNTERPOINT RULES DATA
// ============================================================================

const counterpointRulesData: CounterpointRuleDoc[] = [
  // First Species (note against note)
  {
    id: 'counterpoint_1_1',
    name: '1ª Espécie - Movimento Reto',
    description: {
      pt: 'Movimento reto permitido apenas em graus consonantes perfeitos',
      en: 'Parallel motion only allowed in perfect consonances'
    },
    species: 1,
    forbidden_movements: ['Mover em quintas ou oitavas paralelas', 'Cruzar vozes'],
    required_resolutions: ['Terça ou sexta imperfeita são permitidas'],
    regional_exceptions: {
      genre: 'brega',
      allowed_movements: ['Quintas paralelas podem ser usadas para efeito nostálgico']
    }
  },
  {
    id: 'counterpoint_1_2',
    name: '1ª Espécie - Consonâncias',
    description: {
      pt: 'Apenas intervalos consonantes são permitidos',
      en: 'Only consonant intervals are allowed'
    },
    species: 1,
    forbidden_movements: ['Segundas, quartas, sétimas e trítonos'],
    required_resolutions: ['Usar terças, quintas, sextas e oitavas'],
    regional_exceptions: {
      genre: 'forro',
      allowed_movements: ['Quartas justas podem ser usadas em vozes internas']
    }
  },
  // Second Species (two notes against one)
  {
    id: 'counterpoint_2_1',
    name: '2ª Espécie - Dissonância de Passagem',
    description: {
      pt: 'Dissonância permitida como nota de passagem',
      en: 'Dissonance allowed as passing tone'
    },
    species: 2,
    forbidden_movements: ['Dissonância no tempo forte'],
    required_resolutions: ['Dissonância deve mover por grau conjunto'],
    regional_exceptions: undefined
  },
  // Third Species (four notes against one)
  {
    id: 'counterpoint_3_1',
    name: '3ª Espécie - Cambiata',
    description: {
      pt: 'Cambiata: três notas saltando',
      en: 'Cambiata: three-note escape tone'
    },
    species: 3,
    forbidden_movements: ['Saltos maiores que terça em dissonância'],
    required_resolutions: ['Retornar à consonância por grau conjunto'],
    regional_exceptions: {
      genre: 'brega',
      allowed_movements: ['Saltos de quarta podem ser usados ornamentalmente']
    }
  },
  // Fourth Species (suspension)
  {
    id: 'counterpoint_4_1',
    name: '4ª Espécie - Retardo',
    description: {
      pt: 'Retardo: preparação, dissonância, resolução',
      en: 'Suspension: preparation, dissonance, resolution'
    },
    species: 4,
    forbidden_movements: ['Resolver por movimento reto ascendente'],
    required_resolutions: ['Resolver por grau conjunto descendente'],
    regional_exceptions: {
      genre: 'brega',
      allowed_movements: ['Retardos 4-3 e 9-8 são altamente expressivos']
    }
  },
  // Fifth Species (florid counterpoint)
  {
    id: 'counterpoint_5_1',
    name: '5ª Espécie - Contraponto Florida',
    description: {
      pt: 'Combinação livre de todas as espécies',
      en: 'Free combination of all species'
    },
    species: 5,
    forbidden_movements: ['Cruzar vozes excessivamente', 'Dissonâncias não preparadas'],
    required_resolutions: ['Manrar clareza rítmica e melódica'],
    regional_exceptions: {
      genre: 'forro',
      allowed_movements: ['Síncopas rítmicas são permitidas e incentivadas']
    }
  },
  // Dufay specific rules
  {
    id: 'dufay_cadence',
    name: 'Cadência de Dufay',
    description: {
      pt: 'Regras específicas de cadência do estilo de Dufay',
      en: 'Dufay style specific cadence rules'
    },
    species: 5,
    forbidden_movements: ['Saltos de trítono na cadência'],
    required_resolutions: ['7-8 retardos na voz superior', '2-3 retardos em baixo'],
    regional_exceptions: {
      genre: 'brega',
      allowed_movements: ['Retardos podem ser ornamentados com apojaturas']
    }
  }
];

// ============================================================================
// GENRE TEMPLATES DATA
// ============================================================================

const genreTemplatesData: GenreTemplate[] = [
  {
    id: 'brega_romantico',
    name: 'Brega Romântico',
    category: 'brega',
    tempo_range: {min: 85, max: 105},
    time_signature: {numerator: 4, denominator: 4},
    typical_keys: ['C Major', 'G Major', 'F Major', 'D Minor'],
    partimento_schema: 'Rule_of_Octave_Modified',
    harmonic_rules: [
      'Ênfase em acordes menores relativos (vi) para emoção',
      'Uso frequente de II-V-I secundários',
      'Retardos 4-3 e 9-8 são essenciais',
      'Cadências deceptivas (V-vi) antes do refrão'
    ],
    groove_template: {
      swing: 0.0,
      accent_pattern: [1, 0.5, 1, 0.5],
      micro_timing: [0, 50, 0, 50]
    },
    typical_instrumentation: {
      rhythm: ['bateria', 'baixo', 'piano', 'guitarra'],
      harmony: ['piano', 'synth_pad', 'strings'],
      melody: ['saxophone', 'trumpet', 'synth_lead', 'vocal'],
      bass: ['double_bass', 'synth_bass', 'baixo_elétrico']
    },
    mix_template: {
      reverb_damp: 2000,
      compression_ratio: 4,
      stereo_width: 80,
      bass_boost: 3
    },
    cultural_references: [
      'Melancolia nordestina',
      'Saudade e nostálgia',
      'Dramaticidade emocional',
      'Intimismo e romance'
    ],
    representative_artists: [
      'Waldick Soriano',
      'Reginado Rossi',
      'Falcão',
      'Banda Magda'
    ]
  },
  {
    id: 'forro_piseiro',
    name: 'Forró Piseiro',
    category: 'forro',
    tempo_range: {min: 155, max: 175},
    time_signature: {numerator: 4, denominator: 4},
    typical_keys: ['C Major', 'G Major', 'F Major'],
    partimento_schema: 'Forro_Baiao',
    harmonic_rules: [
      'I-IV-I-V padrão baião',
      'Acordes shell (1-7) para clareza rítmica',
      'Mínima movimentação harmônica',
      'Ênfase no ritmo sobre harmonia'
    ],
    groove_template: {
      swing: 0.4,
      accent_pattern: [1, 0.8, 1, 0.8],
      micro_timing: [0, 30, 0, 30]
    },
    typical_instrumentation: {
      rhythm: ['zabumba', 'triangulo', 'sanfona'],
      harmony: ['sanfona', 'guitarra', 'piano'],
      melody: ['pifano', 'sanfona', 'vocal'],
      bass: ['zabumba', 'baixo_elétrico']
    },
    mix_template: {
      reverb_damp: 3000,
      compression_ratio: 6,
      stereo_width: 60,
      bass_boost: 5
    },
    cultural_references: [
      'Festas juninas',
      'Tradição nordestina',
      'Energia coletiva',
      'Dança e romance'
    ],
    representative_artists: [
      'Luiz Gonzaga',
      'Dominguinhos',
      'Jackson do Pandeiro',
      'Aviões do Forró'
    ]
  },
  {
    id: 'tecnobrega',
    name: 'Tecnobrega',
    category: 'tecnobrega',
    tempo_range: {min: 120, max: 135},
    time_signature: {numerator: 4, denominator: 4},
    typical_keys: ['A Minor', 'E Minor', 'D Minor'],
    partimento_schema: 'Tecnobrega',
    harmonic_rules: [
      'i-VI-III-VII (andróginas)',
      'Padrões repetitivos de 4-8 compassos',
      'Ênfase em graves potentes',
      'Sintetizadores como base harmônica'
    ],
    groove_template: {
      swing: 0.0,
      accent_pattern: [1, 1, 1, 1],
      micro_timing: [0, 0, 0, 0]
    },
    typical_instrumentation: {
      rhythm: ['bateria_808', 'synth_bass'],
      harmony: ['synth_pad', 'synth_lead', 'piano'],
      melody: ['synth_lead', 'vocal', 'sampler'],
      bass: ['synth_bass', 'sub_bass']
    },
    mix_template: {
      reverb_damp: 1500,
      compression_ratio: 8,
      stereo_width: 100,
      bass_boost: 8
    },
    cultural_references: [
      'Periferia urbana',
      'Apaixonadinhos',
      'Sound systems de Belém',
      'Fusão tecnológica'
    ],
    representative_artists: [
      'Banda Tecno',
      'Melim',
      'João Gomes',
      'Pabllo Vittar'
    ]
  },
  {
    id: 'forro_tradicional',
    name: 'Forró Tradicional',
    category: 'forro',
    tempo_range: {min: 140, max: 160},
    time_signature: {numerator: 2, denominator: 4},
    typical_keys: ['C Major', 'G Major', 'F Major'],
    partimento_schema: 'Forro_Baiao',
    harmonic_rules: [
      'I-IV-V progressão básica',
      'Acordes em posição fundamental',
      'Harmonia simples e direta'
    ],
    groove_template: {
      swing: 0.5,
      accent_pattern: [1, 1],
      micro_timing: [0, 50]
    },
    typical_instrumentation: {
      rhythm: ['zabumba', 'triangulo'],
      harmony: ['sanfona', 'guitarra'],
      melody: ['pifano', 'sanfona', 'vocal'],
      bass: ['zabumba']
    },
    mix_template: {
      reverb_damp: 4000,
      compression_ratio: 3,
      stereo_width: 40,
      bass_boost: 4
    },
    cultural_references: [
      'Sertão nordestino',
      'Tradição rural',
      'Raiz cultural',
      'Memória afetiva'
    ],
    representative_artists: [
      'Luiz Gonzaga',
      'Jackson do Pandeiro',
      'Dominguinhos',
      'Sivuca'
    ]
  }
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedMusicTheory(): Promise<{
  scales: number;
  chords: number;
  progressions: number;
  instruments: number;
  partimentoRules: number;
  counterpointRules: number;
  genreTemplates: number;
}> {
  const batch = db.batch();
  const musicTheoryRef = db.collection('music_theory');

  // Seed scales
  let scalesCount = 0;
  const scalesRef = musicTheoryRef.collection('scales');
  for (const scale of scalesData) {
    const docRef = scalesRef.doc(scale.id);
    batch.set(docRef, scale);
    scalesCount++;
  }

  // Seed chords
  let chordsCount = 0;
  const chordsRef = musicTheoryRef.collection('chords');
  for (const chord of chordsData) {
    const docRef = chordsRef.doc(chord.id);
    batch.set(docRef, chord);
    chordsCount++;
  }

  // Seed progressions
  let progressionsCount = 0;
  const progressionsRef = musicTheoryRef.collection('progressions');
  for (const progression of progressionsData) {
    const docRef = progressionsRef.doc(progression.id);
    batch.set(docRef, progression);
    progressionsCount++;
  }

  // Seed instruments
  let instrumentsCount = 0;
  const instrumentsRef = musicTheoryRef.collection('instruments');
  for (const instrument of instrumentsData) {
    const docRef = instrumentsRef.doc(instrument.id);
    batch.set(docRef, instrument);
    instrumentsCount++;
  }

  // Seed partimento rules
  let partimentoRulesCount = 0;
  const partimentoRef = musicTheoryRef.collection('partimento_rules');
  for (const rule of partimentoRulesData) {
    const docRef = partimentoRef.doc(rule.id);
    batch.set(docRef, rule);
    partimentoRulesCount++;
  }

  // Seed counterpoint rules
  let counterpointRulesCount = 0;
  const counterpointRef = musicTheoryRef.collection('counterpoint_rules');
  for (const rule of counterpointRulesData) {
    const docRef = counterpointRef.doc(rule.id);
    batch.set(docRef, rule);
    counterpointRulesCount++;
  }

  await batch.commit();

  // Seed genre templates separately (in synkrony collection)
  let genreTemplatesCount = 0;
  const synkronyRef = db.collection('synkrony');
  const templatesRef = synkronyRef.collection('genre_templates');
  const batch2 = db.batch();

  for (const template of genreTemplatesData) {
    const docRef = templatesRef.doc(template.id);
    batch2.set(docRef, template);
    genreTemplatesCount++;
  }

  await batch2.commit();

  return {
    scales: scalesCount,
    chords: chordsCount,
    progressions: progressionsCount,
    instruments: instrumentsCount,
    partimentoRules: partimentoRulesCount,
    counterpointRules: counterpointRulesCount,
    genreTemplates: genreTemplatesCount
  };
}
