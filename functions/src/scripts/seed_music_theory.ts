import * as admin from 'firebase-admin';

// ============================================================================
// SYNKRONY MUSIC THEORY SEED
// Populates Firestore with scales, chords, progressions, instruments,
// partimento rules, and regional templates for Brega, Forró, and Tecnobrega.
// ============================================================================

// ============================================================================
// DATA - SCALES (12 major + 12 minor + modal + pentatonic + regional)
// ============================================================================

const SCALES = [
  // Major Scales (12)
  {
    id: 'scale_c_major',
    name: {pt: 'Dó Maior', en: 'C Major'},
    root: 0,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior', 'brega', 'forro'],
    chords: ['chord_c', 'chord_dm', 'chord_em', 'chord_f', 'chord_g', 'chord_am', 'chord_bdim'],
    partimento_rules: ['rule_octave_c', 'rule_cadence_c'],
    regional_style: null
  },
  {
    id: 'scale_g_major',
    name: {pt: 'Sol Maior', en: 'G Major'},
    root: 7,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior', 'brega'],
    chords: ['chord_g', 'chord_am', 'chord_bm', 'chord_c', 'chord_d', 'chord_em', 'chord_fshdim'],
    partimento_rules: ['rule_octave_g', 'rule_cadence_g'],
    regional_style: null
  },
  {
    id: 'scale_d_major',
    name: {pt: 'Ré Maior', en: 'D Major'},
    root: 2,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior', 'forro'],
    chords: ['chord_d', 'chord_em', 'chord_fsm', 'chord_g', 'chord_a', 'chord_bm', 'chord_cshdim'],
    partimento_rules: ['rule_octave_d', 'rule_cadence_d'],
    regional_style: null
  },
  {
    id: 'scale_a_major',
    name: {pt: 'Lá Maior', en: 'A Major'},
    root: 9,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_a', 'chord_bm', 'chord_cshm', 'chord_d', 'chord_e', 'chord_fsm', 'chord_gshdim'],
    partimento_rules: ['rule_octave_a', 'rule_cadence_a'],
    regional_style: null
  },
  {
    id: 'scale_e_major',
    name: {pt: 'Mi Maior', en: 'E Major'},
    root: 4,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_e', 'chord_fsm', 'chord_gshm', 'chord_a', 'chord_b', 'chord_cshm', 'chord_dshdim'],
    partimento_rules: ['rule_octave_e', 'rule_cadence_e'],
    regional_style: null
  },
  {
    id: 'scale_b_major',
    name: {pt: 'Si Maior', en: 'B Major'},
    root: 11,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_b', 'chord_cshm', 'chord_dshm', 'chord_e', 'chord_fsm', 'chord_gshm', 'chord_ashdim'],
    partimento_rules: ['rule_octave_b', 'rule_cadence_b'],
    regional_style: null
  },
  {
    id: 'scale_fs_major',
    name: {pt: 'Fá Sustenido Maior', en: 'F# Major'},
    root: 6,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_fs', 'chord_gshm', 'chord_ashm', 'chord_b', 'chord_cs', 'chord_dshm', 'chord_eshdim'],
    partimento_rules: ['rule_octave_fs', 'rule_cadence_fs'],
    regional_style: null
  },
  {
    id: 'scale_db_major',
    name: {pt: 'Ré Bemol Maior', en: 'Db Major'},
    root: 1,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_db', 'chord_ebm', 'chord_fm', 'chord_gb', 'chord_ab', 'chord_bbm', 'chord_cdim'],
    partimento_rules: ['rule_octave_db', 'rule_cadence_db'],
    regional_style: null
  },
  {
    id: 'scale_ab_major',
    name: {pt: 'Lá Bemol Maior', en: 'Ab Major'},
    root: 8,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_ab', 'chord_bbm', 'chord_cm', 'chord_db', 'chord_eb', 'chord_fm', 'chord_gdim'],
    partimento_rules: ['rule_octave_ab', 'rule_cadence_ab'],
    regional_style: null
  },
  {
    id: 'scale_eb_major',
    name: {pt: 'Mi Bemol Maior', en: 'Eb Major'},
    root: 3,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior'],
    chords: ['chord_eb', 'chord_fm', 'chord_gm', 'chord_ab', 'chord_bb', 'chord_cm', 'chord_ddim'],
    partimento_rules: ['rule_octave_eb', 'rule_cadence_eb'],
    regional_style: null
  },
  {
    id: 'scale_bb_major',
    name: {pt: 'Si Bemol Maior', en: 'Bb Major'},
    root: 10,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior', 'brega'],
    chords: ['chord_bb', 'chord_cm', 'chord_dm', 'chord_eb', 'chord_f', 'chord_gm', 'chord_adim'],
    partimento_rules: ['rule_octave_bb', 'rule_cadence_bb'],
    regional_style: null
  },
  {
    id: 'scale_f_major',
    name: {pt: 'Fá Maior', en: 'F Major'},
    root: 5,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'major' as const,
    tags: ['diatônica', 'maior', 'brega', 'forro'],
    chords: ['chord_f', 'chord_gm', 'chord_am', 'chord_bb', 'chord_c', 'chord_dm', 'chord_edim'],
    partimento_rules: ['rule_octave_f', 'rule_cadence_f'],
    regional_style: null
  },

  // Minor Scales (Natural) - 12
  {
    id: 'scale_a_minor',
    name: {pt: 'Lá Menor', en: 'A Minor'},
    root: 9,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor', 'brega'],
    chords: ['chord_am', 'chord_bdim', 'chord_c', 'chord_dm', 'chord_em', 'chord_f', 'chord_g'],
    partimento_rules: ['rule_octave_am', 'rule_cadence_am'],
    regional_style: null
  },
  {
    id: 'scale_e_minor',
    name: {pt: 'Mi Menor', en: 'E Minor'},
    root: 4,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor', 'forro'],
    chords: ['chord_em', 'chord_fsm', 'chord_g', 'chord_am', 'chord_bm', 'chord_c', 'chord_d'],
    partimento_rules: ['rule_octave_em', 'rule_cadence_em'],
    regional_style: null
  },
  {
    id: 'scale_d_minor',
    name: {pt: 'Ré Menor', en: 'D Minor'},
    root: 2,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_dm', 'chord_edim', 'chord_f', 'chord_gm', 'chord_am', 'chord_bb', 'chord_c'],
    partimento_rules: ['rule_octave_dm', 'rule_cadence_dm'],
    regional_style: null
  },
  {
    id: 'scale_b_minor',
    name: {pt: 'Si Menor', en: 'B Minor'},
    root: 11,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_bm', 'chord_cshdim', 'chord_d', 'chord_em', 'chord_fsm', 'chord_g', 'chord_a'],
    partimento_rules: ['rule_octave_bm', 'rule_cadence_bm'],
    regional_style: null
  },
  {
    id: 'scale_fs_minor',
    name: {pt: 'Fá Sustenido Menor', en: 'F# Minor'},
    root: 6,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_fsm', 'chord_gshdim', 'chord_a', 'chord_bm', 'chord_cshm', 'chord_d', 'chord_e'],
    partimento_rules: ['rule_octave_fsm', 'rule_cadence_fsm'],
    regional_style: null
  },
  {
    id: 'scale_cs_minor',
    name: {pt: 'Dó Sustenido Menor', en: 'C# Minor'},
    root: 1,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_cs', 'chord_dshdim', 'chord_e', 'chord_fsm', 'chord_gshm', 'chord_a', 'chord_b'],
    partimento_rules: ['rule_octave_cs', 'rule_cadence_cs'],
    regional_style: null
  },
  {
    id: 'scale_gs_minor',
    name: {pt: 'Sol Sustenido Menor', en: 'G# Minor'},
    root: 8,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_gsharpm', 'chord_ashdim', 'chord_b', 'chord_cshm', 'chord_dshm', 'chord_e', 'chord_fsm'],
    partimento_rules: ['rule_octave_gshm', 'rule_cadence_gshm'],
    regional_style: null
  },
  {
    id: 'scale_ds_minor',
    name: {pt: 'Ré Sustenido Menor', en: 'D# Minor'},
    root: 3,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_dsharpm', 'chord_eshdim', 'chord_fsm', 'chord_gshm', 'chord_ashm', 'chord_b', 'chord_cs'],
    partimento_rules: ['rule_octave_dshm', 'rule_cadence_dshm'],
    regional_style: null
  },
  {
    id: 'scale_bb_minor',
    name: {pt: 'Si Bemol Menor', en: 'Bb Minor'},
    root: 10,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_bb_m', 'chord_cdim', 'chord_db', 'chord_ebm', 'chord_fm', 'chord_gb', 'chord_ab'],
    partimento_rules: ['rule_octave_bbm', 'rule_cadence_bbm'],
    regional_style: null
  },
  {
    id: 'scale_ef_minor',
    name: {pt: 'Mi Bemol Menor', en: 'Eb Minor'},
    root: 3,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor'],
    chords: ['chord_ebm', 'chord_fdim', 'chord_gb', 'chord_ab', 'chord_bbm', 'chord_cb', 'chord_db'],
    partimento_rules: ['rule_octave_ebm', 'rule_cadence_ebm'],
    regional_style: null
  },
  {
    id: 'scale_g_minor',
    name: {pt: 'Sol Menor', en: 'G Minor'},
    root: 7,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor', 'brega'],
    chords: ['chord_gm', 'chord_adim', 'chord_bb', 'chord_cm', 'chord_dm', 'chord_eb', 'chord_f'],
    partimento_rules: ['rule_octave_gm', 'rule_cadence_gm'],
    regional_style: null
  },
  {
    id: 'scale_c_minor',
    name: {pt: 'Dó Menor', en: 'C Minor'},
    root: 0,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'minor' as const,
    tags: ['diatônica', 'menor', 'brega'],
    chords: ['chord_cm', 'chord_ddim', 'chord_eb', 'chord_fm', 'chord_gm', 'chord_ab', 'chord_bb'],
    partimento_rules: ['rule_octave_cm', 'rule_cadence_cm'],
    regional_style: null
  },

  // Pentatonic Scales
  {
    id: 'scale_c_pentatonic_major',
    name: {pt: 'Pentatônica Maior de Dó', en: 'C Major Pentatonic'},
    root: 0,
    intervals: [0, 2, 4, 7, 9],
    type: 'pentatonic' as const,
    tags: ['pentatônica', 'melodia', 'forro'],
    chords: ['chord_c', 'chord_dm', 'chord_em', 'chord_g', 'chord_am'],
    partimento_rules: [],
    regional_style: 'forro'
  },
  {
    id: 'scale_c_pentatonic_minor',
    name: {pt: 'Pentatônica Menor de Dó', en: 'C Minor Pentatonic'},
    root: 0,
    intervals: [0, 3, 5, 7, 10],
    type: 'pentatonic' as const,
    tags: ['pentatônica', 'blues', 'brega'],
    chords: ['chord_cm', 'chord_eb', 'chord_fm', 'chord_g', 'chord_bb'],
    partimento_rules: [],
    regional_style: 'brega'
  },
  {
    id: 'scale_c_blues',
    name: {pt: 'Blues de Dó', en: 'C Blues'},
    root: 0,
    intervals: [0, 3, 5, 6, 7, 10],
    type: 'blues' as const,
    tags: ['blues', 'brega'],
    chords: ['chord_c', 'chord_cm', 'chord_fm', 'chord_g'],
    partimento_rules: [],
    regional_style: 'brega'
  },

  // Modal Scales
  {
    id: 'scale_d_dorian',
    name: {pt: 'Dórico de Ré', en: 'D Dorian'},
    root: 2,
    intervals: [0, 2, 3, 5, 7, 9, 10],
    type: 'modal' as const,
    tags: ['modo', 'dórico', 'jazz'],
    chords: ['chord_dm', 'chord_em', 'chord_f', 'chord_g', 'chord_am', 'chord_bdim', 'chord_c'],
    partimento_rules: [],
    regional_style: null
  },
  {
    id: 'scale_e_phrygian',
    name: {pt: 'Frígio de Mi', en: 'E Phrygian'},
    root: 4,
    intervals: [0, 1, 3, 5, 7, 8, 10],
    type: 'modal' as const,
    tags: ['modo', 'frígio', 'flamenco'],
    chords: ['chord_em', 'chord_f', 'chord_g', 'chord_am', 'chord_bdim', 'chord_c', 'chord_dm'],
    partimento_rules: [],
    regional_style: null
  },
  {
    id: 'scale_f_lydian',
    name: {pt: 'Lídio de Fá', en: 'F Lydian'},
    root: 5,
    intervals: [0, 2, 4, 6, 7, 9, 11],
    type: 'modal' as const,
    tags: ['modo', 'lídio', 'sonoro'],
    chords: ['chord_f', 'chord_g', 'chord_am', 'chord_bdim', 'chord_c', 'chord_dm', 'chord_em'],
    partimento_rules: [],
    regional_style: null
  },
  {
    id: 'scale_g_mixolydian',
    name: {pt: 'Mixolídio de Sol', en: 'G Mixolydian'},
    root: 7,
    intervals: [0, 2, 4, 5, 7, 9, 10],
    type: 'modal' as const,
    tags: ['modo', 'mixolídio', 'rock', 'brega'],
    chords: ['chord_g', 'chord_am', 'chord_bdim', 'chord_c', 'chord_dm', 'chord_em', 'chord_fm'],
    partimento_rules: [],
    regional_style: 'brega'
  },
  {
    id: 'scale_a_aeolian',
    name: {pt: 'Eólio de Lá', en: 'A Aeolian'},
    root: 9,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    type: 'modal' as const,
    tags: ['modo', 'eólio', 'menor'],
    chords: ['chord_am', 'chord_bdim', 'chord_c', 'chord_dm', 'chord_em', 'chord_f', 'chord_g'],
    partimento_rules: [],
    regional_style: null
  },

  // Regional Scales - Brega & Forró
  {
    id: 'scale_brega_romantico',
    name: {pt: 'Escala Brega Romântico', en: 'Brega Romântico Scale'},
    root: 0,
    intervals: [0, 2, 4, 5, 7, 9, 10],
    type: 'brega' as const,
    tags: ['brega', 'romântico', 'nordeste'],
    chords: ['chord_c', 'chord_dm', 'chord_em', 'chord_f', 'chord_g', 'chord_am', 'chord_g'],
    partimento_rules: ['rule_brega_cadence', 'rule_brega_suspension'],
    regional_style: 'brega'
  },
  {
    id: 'scale_forro_piseiro',
    name: {pt: 'Escala Forró Piseiro', en: 'Forró Piseiro Scale'},
    root: 2,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    type: 'forro' as const,
    tags: ['forro', 'piseiro', 'baiao'],
    chords: ['chord_d', 'chord_em', 'chord_fsm', 'chord_g', 'chord_a', 'chord_bm', 'chord_cshdim'],
    partimento_rules: ['rule_forro_syncopation', 'rule_forro_bassline'],
    regional_style: 'forro'
  },
  {
    id: 'scale_tecnobrega',
    name: {pt: 'Escala Tecnobrega', en: 'Tecnobrega Scale'},
    root: 0,
    intervals: [0, 3, 5, 7, 10],
    type: 'tecnobrega' as const,
    tags: ['tecnobrega', 'eletrônico', 'belem'],
    chords: ['chord_cm', 'chord_eb', 'chord_fm', 'chord_g', 'chord_bb'],
    partimento_rules: ['rule_tecnobrega_bass'],
    regional_style: 'tecnobrega'
  }
];

// ============================================================================
// DATA - CHORDS
// ============================================================================

const CHORDS = [
  // Major Triads
  {
    id: 'chord_c',
    name: {pt: 'Dó Maior', en: 'C Major'},
    symbols: ['C', 'Cmaj'],
    root: 0,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_c_major', 'scale_f_major', 'scale_g_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'},
      {name: 'Primeira Inversão', notes: [-4, 0, 5], style: 'fechado'},
      {name: 'Segunda Inversão', notes: [-7, -3, 0], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths', 'rule_resolve_tendency']
  },
  {
    id: 'chord_db',
    name: {pt: 'Ré Bemol Maior', en: 'Db Major'},
    symbols: ['Db', 'Dbmaj'],
    root: 1,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_db_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_d',
    name: {pt: 'Ré Maior', en: 'D Major'},
    symbols: ['D', 'Dmaj'],
    root: 2,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_d_major', 'scale_g_major', 'scale_a_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'},
      {name: 'Forró Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'forro'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_eb',
    name: {pt: 'Mi Bemol Maior', en: 'Eb Major'},
    symbols: ['Eb', 'Ebmaj'],
    root: 3,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_eb_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_e',
    name: {pt: 'Mi Maior', en: 'E Major'},
    symbols: ['E', 'Emaj'],
    root: 4,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_e_major', 'scale_a_major', 'scale_b_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_f',
    name: {pt: 'Fá Maior', en: 'F Major'},
    symbols: ['F', 'Fmaj'],
    root: 5,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_f_major', 'scale_bb_major', 'scale_c_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_fs',
    name: {pt: 'Fá Sustenido Maior', en: 'F# Major'},
    symbols: ['F#', 'F#maj'],
    root: 6,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_fs_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_g',
    name: {pt: 'Sol Maior', en: 'G Major'},
    symbols: ['G', 'Gmaj'],
    root: 7,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_g_major', 'scale_c_major', 'scale_d_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_ab',
    name: {pt: 'Lá Bemol Maior', en: 'Ab Major'},
    symbols: ['Ab', 'Abmaj'],
    root: 8,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_ab_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_a',
    name: {pt: 'Lá Maior', en: 'A Major'},
    symbols: ['A', 'Amaj'],
    root: 9,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_a_major', 'scale_d_major', 'scale_e_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_bb',
    name: {pt: 'Si Bemol Maior', en: 'Bb Major'},
    symbols: ['Bb', 'Bbmaj'],
    root: 10,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_bb_major', 'scale_eb_major', 'scale_f_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_b',
    name: {pt: 'Si Maior', en: 'B Major'},
    symbols: ['B', 'Bmaj'],
    root: 11,
    intervals: [0, 4, 7],
    type: 'triad' as const,
    function: 'I',
    scales: ['scale_b_major', 'scale_e_major', 'scale_fs_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 4, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },

  // Minor Triads
  {
    id: 'chord_cm',
    name: {pt: 'Dó Menor', en: 'C Minor'},
    symbols: ['Cm', 'Cmin'],
    root: 0,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'i',
    scales: ['scale_c_minor', 'scale_eb_major', 'scale_bb_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths', 'rule_raise_leading_tone']
  },
  {
    id: 'chord_dm',
    name: {pt: 'Ré Menor', en: 'D Minor'},
    symbols: ['Dm', 'Dmin'],
    root: 2,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'ii',
    scales: ['scale_d_minor', 'scale_f_major', 'scale_bb_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_em',
    name: {pt: 'Mi Menor', en: 'E Minor'},
    symbols: ['Em', 'Emin'],
    root: 4,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'iii',
    scales: ['scale_e_minor', 'scale_g_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'},
      {name: 'Forró Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'forro'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_fm',
    name: {pt: 'Fá Menor', en: 'F Minor'},
    symbols: ['Fm', 'Fmin'],
    root: 5,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'iv',
    scales: ['scale_fm', 'scale_ab_major', 'scale_eb_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_gm',
    name: {pt: 'Sol Menor', en: 'G Minor'},
    symbols: ['Gm', 'Gmin'],
    root: 7,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'v',
    scales: ['scale_g_minor', 'scale_bb_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths', 'rule_raise_leading_tone']
  },
  {
    id: 'chord_am',
    name: {pt: 'Lá Menor', en: 'A Minor'},
    symbols: ['Am', 'Amin'],
    root: 9,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'vi',
    scales: ['scale_a_minor', 'scale_c_major'],
    voicings: [
      {name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'},
      {name: 'Brega Style', notes: [0, 7, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_bm',
    name: {pt: 'Si Menor', en: 'B Minor'},
    symbols: ['Bm', 'Bmin'],
    root: 11,
    intervals: [0, 3, 7],
    type: 'triad' as const,
    function: 'vii',
    scales: ['scale_b_minor', 'scale_d_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 3, 7], style: 'fechado'}],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },

  // Diminished Triads
  {
    id: 'chord_bdim',
    name: {pt: 'Si Diminuto', en: 'B Diminished'},
    symbols: ['B°', 'Bdim'],
    root: 11,
    intervals: [0, 3, 6],
    type: 'triad' as const,
    function: 'viio',
    scales: ['scale_c_major'],
    voicings: [{name: 'Posição Fundamental', notes: [0, 3, 6], style: 'fechado'}],
    counterpoint_rules: ['rule_resolve_diminished']
  },

  // Seventh Chords
  {
    id: 'chord_cmaj7',
    name: {pt: 'Dó Maior com Sétima', en: 'C Major 7'},
    symbols: ['Cmaj7', 'CM7'],
    root: 0,
    intervals: [0, 4, 7, 11],
    type: 'seventh' as const,
    function: 'Imaj7',
    scales: ['scale_c_major'],
    voicings: [
      {name: 'Drop 2', notes: [0, 4, 7, 11], style: 'drop2'},
      {name: 'Brega Ballad', notes: [0, 7, 11, 14], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_no_parallel_fifths']
  },
  {
    id: 'chord_c7',
    name: {pt: 'Dó com Sétima da Dominante', en: 'C Dominant 7'},
    symbols: ['C7', 'Cdom7'],
    root: 0,
    intervals: [0, 4, 7, 10],
    type: 'seventh' as const,
    function: 'V7',
    scales: ['scale_f_major', 'scale_bb_major'],
    voicings: [
      {name: 'Drop 2', notes: [0, 4, 7, 10], style: 'drop2'},
      {name: 'Brega Suspense', notes: [0, 7, 10, 12], style: 'aberto', regional_style: 'brega'}
    ],
    counterpoint_rules: ['rule_resolve_seventh']
  },
  {
    id: 'chord_a7',
    name: {pt: 'Lá com Sétima da Dominante', en: 'A Dominant 7'},
    symbols: ['A7', 'Adom7'],
    root: 9,
    intervals: [0, 4, 7, 10],
    type: 'seventh' as const,
    function: 'V7',
    scales: ['scale_d_major', 'scale_g_major'],
    voicings: [
      {name: 'Forró Vamp', notes: [0, 7, 10, 12], style: 'aberto', regional_style: 'forro'}
    ],
    counterpoint_rules: ['rule_resolve_seventh']
  },
  {
    id: 'chord_e7',
    name: {pt: 'Mi com Sétima da Dominante', en: 'E Dominant 7'},
    symbols: ['E7', 'Edom7'],
    root: 4,
    intervals: [0, 4, 7, 10],
    type: 'seventh' as const,
    function: 'V7',
    scales: ['scale_a_major', 'scale_d_major'],
    voicings: [{name: 'Drop 2', notes: [0, 4, 7, 10], style: 'drop2'}],
    counterpoint_rules: ['rule_resolve_seventh']
  },
  {
    id: 'chord_d7',
    name: {pt: 'Ré com Sétima da Dominante', en: 'D Dominant 7'},
    symbols: ['D7', 'Ddom7'],
    root: 2,
    intervals: [0, 4, 7, 10],
    type: 'seventh' as const,
    function: 'V7',
    scales: ['scale_g_major'],
    voicings: [
      {name: 'Forró Ending', notes: [0, 7, 10, 12], style: 'aberto', regional_style: 'forro'}
    ],
    counterpoint_rules: ['rule_resolve_seventh']
  }
];

// ============================================================================
// DATA - PROGRESSIONS
// ============================================================================

const PROGRESSIONS = [
  // Classical Partimento Progressions
  {
    id: 'prog_rule_of_octave',
    name: {pt: 'Regra da Oitava', en: 'Rule of the Octave'},
    chords: ['chord_c', 'chord_dm', 'chord_em', 'chord_f', 'chord_g', 'chord_am', 'chord_bdim', 'chord_c'],
    category: 'classical' as const,
    description: {
      pt: 'Progressão fundamental do Partimento que define os acordes para cada grau da escala ascendente e descendente.',
      en: 'Fundamental Partimento progression defining chords for each scale degree ascending and descending.'
    },
    commonKeys: ['C', 'G', 'F', 'D', 'Bb', 'Eb'],
    partimento_schema: 'Rule_of_Octave'
  },
  {
    id: 'prog_rule_of_octave_modified',
    name: {pt: 'Regra da Oitava Modificada (Brega)', en: 'Rule of Octave Modified (Brega)'},
    chords: ['chord_c', 'chord_dm', 'chord_em', 'chord_f', 'chord_g', 'chord_am', 'chord_g', 'chord_c'],
    category: 'brega' as const,
    description: {
      pt: 'Adaptação da Regra da Oitava para o Brega Romântico, com predominância de acordes maiores e suspense no grau VII.',
      en: 'Brega Romântico adaptation of Rule of Octave, favoring major chords and suspense on degree VII.'
    },
    commonKeys: ['C', 'G', 'F', 'Eb', 'Bb'],
    variations: ['prog_rule_of_octave', 'prog_brega_ii_v_i'],
    partimento_schema: 'Rule_of_Octave_Modified'
  },

  // Jazz Progressions
  {
    id: 'prog_ii_v_i',
    name: {pt: 'II-V-I', en: 'II-V-I'},
    chords: ['chord_dm', 'chord_g', 'chord_c'],
    category: 'jazz' as const,
    description: {
      pt: 'A cadência mais importante do jazz. Movimento descendente por quintas.',
      en: 'Most important jazz cadence. Descending fifths movement.'
    },
    commonKeys: ['C', 'Bb', 'Eb', 'F', 'Ab'],
    variations: ['prog_ii_v_i_vi', 'prog_vi_ii_v_i'],
    partimento_schema: 'descending_fifth'
  },
  {
    id: 'prog_vi_ii_v_i',
    name: {pt: 'VI-II-V-I (Turnaround)', en: 'VI-II-V-I Turnaround'},
    chords: ['chord_am', 'chord_dm', 'chord_g', 'chord_c'],
    category: 'jazz' as const,
    description: {
      pt: 'Progressão de turnaround que retorna ao tônico.',
      en: 'Turnaround progression leading back to tonic.'
    },
    commonKeys: ['C', 'Bb', 'Eb'],
    variations: ['prog_iii_vi_ii_v_i'],
    partimento_schema: 'turnaround'
  },
  {
    id: 'prog_iii_vi_ii_v_i',
    name: {pt: 'III-VI-II-V-I (Bird)', en: 'III-VI-II-V-I (Bird Changes)'},
    chords: ['chord_em', 'chord_am', 'chord_dm', 'chord_g', 'chord_c'],
    category: 'jazz' as const,
    description: {
      pt: 'Progressão popularizada por Charlie Parker.',
      en: 'Progression popularized by Charlie Parker.'
    },
    commonKeys: ['Bb', 'C', 'F'],
    variations: [],
    partimento_schema: 'bird_changes'
  },

  // Pop Progressions
  {
    id: 'prog_i_v_vi_iv',
    name: {pt: 'I-V-vi-IV', en: 'I-V-vi-IV'},
    chords: ['chord_c', 'chord_g', 'chord_am', 'chord_f'],
    category: 'pop' as const,
    description: {
      pt: 'Uma das progressões mais usadas na música pop.',
      en: 'One of the most used progressions in pop music.'
    },
    commonKeys: ['C', 'G', 'D', 'F'],
    variations: ['prog_i_vi_iv_v'],
    partimento_schema: 'pop_axis'
  },
  {
    id: 'prog_i_vi_iv_v',
    name: {pt: 'I-vi-IV-V (50s)', en: 'I-vi-IV-V (50s Progression)'},
    chords: ['chord_c', 'chord_am', 'chord_f', 'chord_g'],
    category: 'pop' as const,
    description: {
      pt: 'Progressão clássica dos anos 50, base de doo-wop.',
      en: 'Classic 50s progression, doo-wop foundation.'
    },
    commonKeys: ['C', 'F', 'Bb', 'G'],
    variations: ['prog_i_v_vi_iv'],
    partimento_schema: '50s_progression'
  },

  // Blues Progressions
  {
    id: 'prog_12_bar_blues',
    name: {pt: 'Blues de 12 Compassos', en: '12-Bar Blues'},
    chords: ['chord_c', 'chord_c', 'chord_c', 'chord_c', 'chord_f', 'chord_f', 'chord_c', 'chord_c', 'chord_g', 'chord_f', 'chord_c', 'chord_g'],
    category: 'blues' as const,
    description: {
      pt: 'Estrutura de 12 compassos fundamental do blues.',
      en: 'Fundamental 12-bar structure of blues.'
    },
    commonKeys: ['C', 'F', 'Bb', 'Eb', 'G'],
    variations: ['prog_8_bar_blues', 'prog_16_bar_blues'],
    partimento_schema: '12_bar_blues'
  },

  // Brega Progressions
  {
    id: 'prog_brega_ii_v_i',
    name: {pt: 'II-V-I Brega', en: 'Brega II-V-I'},
    chords: ['chord_dm', 'chord_g7', 'chord_c'],
    category: 'brega' as const,
    description: {
      pt: 'Cadência II-V-I adaptada para Brega, com dominante suspensa.',
      en: 'II-V-I cadence adapted for Brega with suspended dominant.'
    },
    commonKeys: ['C', 'G', 'F', 'Eb'],
    variations: ['prog_brega_vi_ii_v'],
    partimento_schema: 'brega_cadence'
  },
  {
    id: 'prog_brega_vi_ii_v',
    name: {pt: 'VI-II-V Brega (Suspenso)', en: 'Brega VI-II-V (Suspense)'},
    chords: ['chord_am', 'chord_dm', 'chord_g'],
    category: 'brega' as const,
    description: {
      pt: 'Progressão de suspense característica do Brega Romântico.',
      en: 'Characteristic suspense progression of Brega Romântico.'
    },
    commonKeys: ['C', 'G', 'F'],
    variations: [],
    partimento_schema: 'brega_suspense'
  },
  {
    id: 'prog_brega_i_iv_v',
    name: {pt: 'I-IV-V Brega', en: 'Brega I-IV-V'},
    chords: ['chord_c', 'chord_f', 'chord_g'],
    category: 'brega' as const,
    description: {
      pt: 'Progressão básica do Brega, emphasizing acordes maiores.',
      en: 'Basic Brega progression emphasizing major chords.'
    },
    commonKeys: ['C', 'G', 'F', 'Eb'],
    variations: ['prog_brega_i_iv_v_i'],
    partimento_schema: 'brega_basic'
  },
  {
    id: 'prog_brega_ballad',
    name: {pt: 'Balada Brega', en: 'Brega Ballad'},
    chords: ['chord_c', 'chord_am', 'chord_dm', 'chord_g', 'chord_c', 'chord_am', 'chord_dm', 'chord_g7'],
    category: 'brega' as const,
    description: {
      pt: 'Progressão de balada romântica usada no Brega.',
      en: 'Romantic ballad progression used in Brega.'
    },
    commonKeys: ['C', 'G', 'F'],
    variations: [],
    partimento_schema: 'brega_ballad'
  },

  // Forró Progressions
  {
    id: 'prog_forro_baião',
    name: {pt: 'Baião (I-V-IV-V)', en: 'Baião (I-V-IV-V)'},
    chords: ['chord_c', 'chord_g7', 'chord_f', 'chord_g7'],
    category: 'forro' as const,
    description: {
      pt: 'Progressão clássica do Baião, com dominante no V.',
      en: 'Classic Baião progression with dominant on V.'
    },
    commonKeys: ['C', 'G', 'F', 'D'],
    variations: ['prog_forro_xamego'],
    partimento_schema: 'baiao'
  },
  {
    id: 'prog_forro_xote',
    name: {pt: 'Xote (I-IV-V)', en: 'Xote (I-IV-V)'},
    chords: ['chord_c', 'chord_f', 'chord_c', 'chord_g7'],
    category: 'forro' as const,
    description: {
      pt: 'Progressão do Xote, ritmo binário acentuado.',
      en: 'Xote progression, accented binary rhythm.'
    },
    commonKeys: ['C', 'G', 'F'],
    variations: [],
    partimento_schema: 'xote'
  },
  {
    id: 'prog_forro_xamego',
    name: {pt: 'Xamego', en: 'Xamego'},
    chords: ['chord_c', 'chord_am', 'chord_dm', 'chord_g7'],
    category: 'forro' as const,
    description: {
      pt: 'Progressão do Xamego, mais melódico que o Baião.',
      en: 'Xamego progression, more melodic than Baião.'
    },
    commonKeys: ['C', 'G', 'F'],
    variations: ['prog_forro_baião'],
    partimento_schema: 'xamego'
  },
  {
    id: 'prog_forro_piseiro',
    name: {pt: 'Piseiro Moderno', en: 'Modern Piseiro'},
    chords: ['chord_c', 'chord_c', 'chord_f', 'chord_f', 'chord_c', 'chord_g', 'chord_c', 'chord_g'],
    category: 'forro' as const,
    description: {
      pt: 'Progressão do Piseiro moderno, com ênfase rítmica.',
      en: 'Modern Piseiro progression with rhythmic emphasis.'
    },
    commonKeys: ['C', 'D', 'G'],
    variations: [],
    partimento_schema: 'piseiro'
  },

  // Tecnobrega Progressions
  {
    id: 'prog_tecnobrega_guy_wire',
    name: {pt: 'Tecnobrega (Synth)', en: 'Tecnobrega Synth Pattern'},
    chords: ['chord_cm', 'chord_ab', 'chord_eb', 'chord_bb'],
    category: 'tecnobrega' as const,
    description: {
      pt: 'Progressão eletrônica do Tecnobrega, sintetizadores pesados.',
      en: 'Electronic Tecnobrega progression, heavy synthesizers.'
    },
    commonKeys: ['Cm', 'Gm', 'Dm'],
    variations: ['prog_tecnobrega_bass'],
    partimento_schema: 'tecnobrega_synth'
  },
  {
    id: 'prog_tecnobrega_bass',
    name: {pt: 'Tecnobrega Bassline', en: 'Tecnobrega Bass Pattern'},
    chords: ['chord_cm', 'chord_cm', 'chord_eb', 'chord_bb'],
    category: 'tecnobrega' as const,
    description: {
      pt: 'Padrão de baixo do Tecnobrega, estilo 808.',
      en: 'Tecnobrega bass pattern, 808 style.'
    },
    commonKeys: ['Cm', 'Gm'],
    variations: [],
    partimento_schema: 'tecnobrega_bass'
  }
];

// ============================================================================
// DATA - INSTRUMENTS
// ============================================================================

const INSTRUMENTS = [
  // Strings
  {
    id: 'inst_violin',
    name: {pt: 'Violino', en: 'Violin'},
    family: 'strings' as const,
    range: {lowest: 55, highest: 88, practical: {lowest: 60, highest: 84}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 40,
    articulations: ['arco', 'pizzicato', 'tremolo', 'sul ponticello', 'sul tasto', 'col legno'],
    dynamics: {pp: 20, ff: 115},
    commonIn: ['orchestra', 'chamber', 'brega_strings', 'forro_regional'],
    xps10Category: 'Strings',
    regional_role: null
  },
  {
    id: 'inst_viola',
    name: {pt: 'Viola', en: 'Viola'},
    family: 'strings' as const,
    range: {lowest: 48, highest: 76, practical: {lowest: 53, highest: 72}},
    transposition: 0,
    clef: 'alto' as const,
    midiProgram: 41,
    articulations: ['arco', 'pizzicato', 'tremolo'],
    dynamics: {pp: 18, ff: 110},
    commonIn: ['orchestra', 'chamber'],
    xps10Category: 'Strings',
    regional_role: null
  },
  {
    id: 'inst_cello',
    name: {pt: 'Violoncelo', en: 'Cello'},
    family: 'strings' as const,
    range: {lowest: 36, highest: 64, practical: {lowest: 41, highest: 60}},
    transposition: 0,
    clef: 'bass' as const,
    midiProgram: 42,
    articulations: ['arco', 'pizzicato', 'tremolo', 'sul ponticello'],
    dynamics: {pp: 15, ff: 105},
    commonIn: ['orchestra', 'chamber', 'brega_ballad', 'brega_strings'],
    xps10Category: 'Strings',
    regional_role: null
  },
  {
    id: 'inst_double_bass',
    name: {pt: 'Contrabaixo Acústico', en: 'Double Bass'},
    family: 'strings' as const,
    range: {lowest: 28, highest: 55, practical: {lowest: 33, highest: 49}},
    transposition: -12,
    clef: 'bass' as const,
    midiProgram: 43,
    articulations: ['arco', 'pizzicato'],
    dynamics: {pp: 20, ff: 100},
    commonIn: ['orchestra', 'jazz', 'forro_tradicional'],
    xps10Category: 'Bass',
    regional_role: 'baixo_forro'
  },

  // Woodwinds
  {
    id: 'inst_flute',
    name: {pt: 'Flauta', en: 'Flute'},
    family: 'woodwinds' as const,
    range: {lowest: 60, highest: 93, practical: {lowest: 65, highest: 89}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 73,
    articulations: ['staccato', 'legato', 'flutter_tongue', 'trill', 'vibrato'],
    dynamics: {pp: 25, ff: 115},
    commonIn: ['orchestra', 'forro_flauta'],
    xps10Category: 'Woodwinds',
    regional_role: 'flauta_forro'
  },
  {
    id: 'inst_clarinet',
    name: {pt: 'Clarinete', en: 'Clarinet'},
    family: 'woodwinds' as const,
    range: {lowest: 50, highest: 86, practical: {lowest: 55, highest: 82}},
    transposition: -2,
    clef: 'treble' as const,
    midiProgram: 71,
    articulations: ['staccato', 'legato', 'flutter_tongue', 'glissando'],
    dynamics: {pp: 20, ff: 115},
    commonIn: ['orchestra', 'band', 'forro'],
    xps10Category: 'Woodwinds',
    regional_role: null
  },
  {
    id: 'inst_saxophone',
    name: {pt: 'Saxofone', en: 'Saxophone'},
    family: 'woodwinds' as const,
    range: {lowest: 47, highest: 77, practical: {lowest: 52, highest: 72}},
    transposition: -9,
    clef: 'treble' as const,
    midiProgram: 65,
    articulations: ['staccato', 'legato', 'growl', 'flutter_tongue', 'bends'],
    dynamics: {pp: 25, ff: 120},
    commonIn: ['brega_sax', 'forro_sax'],
    xps10Category: 'Reed',
    regional_role: 'sax_brega'
  },

  // Brass
  {
    id: 'inst_trumpet',
    name: {pt: 'Trompete', en: 'Trumpet'},
    family: 'brass' as const,
    range: {lowest: 58, highest: 87, practical: {lowest: 64, highest: 84}},
    transposition: -2,
    clef: 'treble' as const,
    midiProgram: 56,
    articulations: ['staccato', 'legato', 'mute', 'falls', 'doits'],
    dynamics: {pp: 30, ff: 120},
    commonIn: ['orchestra', 'jazz', 'brega_brass', 'forro_metais'],
    xps10Category: 'Brass',
    regional_role: 'metais_brega'
  },
  {
    id: 'inst_trombone',
    name: {pt: 'Trombone', en: 'Trombone'},
    family: 'brass' as const,
    range: {lowest: 40, highest: 72, practical: {lowest: 47, highest: 67}},
    transposition: 0,
    clef: 'bass' as const,
    midiProgram: 57,
    articulations: ['staccato', 'legato', 'mute', 'glissando', 'falls'],
    dynamics: {pp: 30, ff: 115},
    commonIn: ['orchestra', 'jazz', 'brega_brass'],
    xps10Category: 'Brass',
    regional_role: null
  },
  {
    id: 'inst_tuba',
    name: {pt: 'Tuba', en: 'Tuba'},
    family: 'brass' as const,
    range: {lowest: 28, highest: 58, practical: {lowest: 33, highest: 52}},
    transposition: 0,
    clef: 'bass' as const,
    midiProgram: 58,
    articulations: ['staccato', 'legato', 'accent'],
    dynamics: {pp: 35, ff: 110},
    commonIn: ['orchestra', 'band'],
    xps10Category: 'Bass',
    regional_role: null
  },

  // Percussion
  {
    id: 'inst_snare_drum',
    name: {pt: 'Caixa', en: 'Snare Drum'},
    family: 'percussion' as const,
    range: {lowest: 0, highest: 0, practical: {lowest: 0, highest: 0}},
    transposition: 0,
    clef: 'percussion' as const,
    midiProgram: 38,
    articulations: ['roll', 'rimshot', 'cross_stick', 'drag'],
    dynamics: {pp: 10, ff: 127},
    commonIn: ['orchestra', 'band', 'brega_drums', 'forro_zabumba'],
    xps10Category: 'Percussion',
    regional_role: null
  },
  {
    id: 'inst_bass_drum',
    name: {pt: 'Bumbo', en: 'Bass Drum'},
    family: 'percussion' as const,
    range: {lowest: 0, highest: 0, practical: {lowest: 0, highest: 0}},
    transposition: 0,
    clef: 'percussion' as const,
    midiProgram: 35,
    articulations: ['roll', 'accent'],
    dynamics: {pp: 30, ff: 127},
    commonIn: ['orchestra', 'brega_drums', 'forro_zabumba'],
    xps10Category: 'Percussion',
    regional_role: null
  },

  // Keyboard
  {
    id: 'inst_piano',
    name: {pt: 'Piano', en: 'Piano'},
    family: 'keyboard' as const,
    range: {lowest: 21, highest: 108, practical: {lowest: 28, highest: 100}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 0,
    articulations: ['staccato', 'legato', 'portato', 'pedal'],
    dynamics: {pp: 10, ff: 127},
    commonIn: ['all', 'brega_piano', 'forro_sanfona'],
    xps10Category: 'Piano',
    regional_role: 'teclado_brega'
  },
  {
    id: 'inst_organ',
    name: {pt: 'Órgão', en: 'Organ'},
    family: 'keyboard' as const,
    range: {lowest: 21, highest: 108, practical: {lowest: 28, highest: 100}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 16,
    articulations: ['legato', 'tremolo', 'percussive'],
    dynamics: {pp: 30, ff: 127},
    commonIn: ['brega_organ', 'religious'],
    xps10Category: 'Organ',
    regional_role: 'orgao_brega'
  },

  // Synth
  {
    id: 'inst_xps10_leads',
    name: {pt: 'XPS-10 Leads', en: 'XPS-10 Lead Synth'},
    family: 'synth' as const,
    range: {lowest: 21, highest: 108, practical: {lowest: 28, highest: 100}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 80,
    articulations: ['portamento', 'vibrato', 'glide', 'bend'],
    dynamics: {pp: 20, ff: 127},
    commonIn: ['brega_synth', 'tecnobrega', 'forro_moderno'],
    xps10Category: 'Synth',
    regional_role: 'leads_teclado'
  },
  {
    id: 'inst_xps10_pads',
    name: {pt: 'XPS-10 Pads', en: 'XPS-10 Pad Synth'},
    family: 'synth' as const,
    range: {lowest: 21, highest: 108, practical: {lowest: 28, highest: 100}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 89,
    articulations: ['long_release', 'slow_attack'],
    dynamics: {pp: 15, ff: 100},
    commonIn: ['brega_pads', 'tecnobrega_ambient'],
    xps10Category: 'Synth',
    regional_role: 'pads_brega'
  },

  // Regional - Brasil
  {
    id: 'inst_pifano',
    name: {pt: 'Pífano', en: 'Pífano (Brazilian Fife)'},
    family: 'regional' as const,
    range: {lowest: 67, highest: 88, practical: {lowest: 69, highest: 84}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 73,
    articulations: ['staccato', 'trill', 'vibrato'],
    dynamics: {pp: 40, ff: 110},
    commonIn: ['forro_banda_de_pife'],
    xps10Category: 'Woodwinds',
    regional_role: 'pifano_forro'
  },
  {
    id: 'inst_zabumba',
    name: {pt: 'Zabumba', en: 'Zabumba'},
    family: 'regional' as const,
    range: {lowest: 0, highest: 0, practical: {lowest: 0, highest: 0}},
    transposition: 0,
    clef: 'percussion' as const,
    midiProgram: 36,
    articulations: ['hit', 'open', 'muffled'],
    dynamics: {pp: 40, ff: 127},
    commonIn: ['forro_zabumba'],
    xps10Category: 'Percussion',
    regional_role: 'zabumba_forro'
  },
  {
    id: 'inst_triangle',
    name: {pt: 'Triângulo', en: 'Triangle'},
    family: 'regional' as const,
    range: {lowest: 0, highest: 0, practical: {lowest: 0, highest: 0}},
    transposition: 0,
    clef: 'percussion' as const,
    midiProgram: 81,
    articulations: ['open', 'closed', 'muted'],
    dynamics: {pp: 40, ff: 120},
    commonIn: ['forro_triangle'],
    xps10Category: 'Percussion',
    regional_role: 'triangulo_forro'
  },
  {
    id: 'inst_sanfona',
    name: {pt: 'Sanfona', en: 'Accordion (Sanfona)'},
    family: 'regional' as const,
    range: {lowest: 41, highest: 88, practical: {lowest: 48, highest: 84}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 21,
    articulations: ['staccato', 'bellows', 'tremolo'],
    dynamics: {pp: 25, ff: 115},
    commonIn: ['forro_sanfona', 'brega_sanity'],
    xps10Category: 'Organ',
    regional_role: 'sanfona_forro'
  },
  {
    id: 'inst_cavaquinho',
    name: {pt: 'Cavaquinho', en: 'Cavaquinho'},
    family: 'regional' as const,
    range: {lowest: 52, highest: 83, practical: {lowest: 57, highest: 76}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 24,
    articulations: ['strum', 'pick', 'rasgueado'],
    dynamics: {pp: 30, ff: 110},
    commonIn: ['forro_cavaquinho', 'choro'],
    xps10Category: 'Guitar',
    regional_role: null
  },

  // Vocal
  {
    id: 'inst_voices_soprano',
    name: {pt: 'Vozes Soprano', en: 'Soprano Voices'},
    family: 'vocal' as const,
    range: {lowest: 60, highest: 88, practical: {lowest: 64, highest: 84}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 52,
    articulations: ['staccato', 'legato', 'vibrato', 'portamento'],
    dynamics: {pp: 40, ff: 120},
    commonIn: ['choir', 'brega_vocals', 'forro_vocals'],
    xps10Category: 'Vox',
    regional_role: null
  },
  {
    id: 'inst_voices_alto',
    name: {pt: 'Vozes Alto', en: 'Alto Voices'},
    family: 'vocal' as const,
    range: {lowest: 53, highest: 79, practical: {lowest: 57, highest: 76}},
    transposition: 0,
    clef: 'treble' as const,
    midiProgram: 53,
    articulations: ['staccato', 'legato', 'vibrato'],
    dynamics: {pp: 35, ff: 115},
    commonIn: ['choir', 'brega_vocals'],
    xps10Category: 'Vox',
    regional_role: null
  }
];

// ============================================================================
// DATA - PARTIMENTO RULES
// ============================================================================

const PARTIMENTO_RULES = [
  // Classical Rules (Dufay, Fenaroli)
  {
    id: 'rule_octave_c',
    name: 'Regra da Oitava - Dó Maior',
    description: {
      pt: 'Voicing completo para o baixo em Dó Maiur segundo a Regra da Oitava.',
      en: 'Complete voicing for bass in C Major according to Rule of the Octave.'
    },
    source: 'fenaroli' as const,
    bass_degree: 0,
    voicing: [0, 4, 7],
    forbidden_intervals: [6],
    regional_adaptation: null
  },
  {
    id: 'rule_cadence_c',
    name: 'Cadência Perfeita - Dó',
    description: {
      pt: 'Cadência V-I em Dó Maior com resolução característica.',
      en: 'Perfect V-I cadence in C Major with characteristic resolution.'
    },
    source: 'dufay' as const,
    bass_degree: 4,
    voicing: [7, 11, 14],
    forbidden_intervals: [6],
    regional_adaptation: null
  },

  // Brega Adaptations
  {
    id: 'rule_brega_cadence',
    name: 'Cadência Brega',
    description: {
      pt: 'Cadência II-V-I adaptada para Brega Romântico com tensões suspensas.',
      en: 'II-V-I cadence adapted for Brega Romântico with suspended tensions.'
    },
    source: 'brega_tradition' as const,
    bass_degree: 4,
    voicing: [0, 7, 10],
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'Sétima adicionada ao V para suspense emocional',
      practice_note: 'Não resolver a sétima imediatamente - manter tensão para efeito dramático'
    }
  },
  {
    id: 'rule_brega_suspension',
    name: 'Suspensão Brega',
    description: {
      pt: 'Acorde de suspense característico do Brega.',
      en: 'Characteristic suspense chord of Brega style.'
    },
    source: 'brega_tradition' as const,
    bass_degree: 6,
    voicing: [0, 7, 10],
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'brega',
      modification: 'Segunda inversão com baixo no dominante',
      practice_note: 'Usar em transições para refrão para máxima tensão emocional'
    }
  },

  // Forró Adaptations
  {
    id: 'rule_forro_syncopation',
    name: 'Síncope Forró',
    description: {
      pt: 'Padrão de baixo sincopado característico do Forró.',
      en: 'Syncopated bass pattern characteristic of Forró.'
    },
    source: 'brega_tradition' as const,
    bass_degree: 0,
    voicing: [0, 4, 7],
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'forro',
      modification: 'Antecipação do baixo no tempo 2 e 4',
      practice_note: 'Criar groove com antecipações sutis no registro grave'
    }
  },
  {
    id: 'rule_forro_bassline',
    name: 'Linha de Baixo Forró',
    description: {
      pt: 'Linha de baixo com sextilas típicas do Baião.',
      en: 'Bass line with characteristic Baião sextuplets.'
    },
    source: 'brega_tradition' as const,
    bass_degree: 0,
    voicing: [0, 7],
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'forro',
      modification: 'Padrão rítmico com sextilas em semínimas',
      practice_note: 'Executar com leve swing para autenticidade regional'
    }
  },

  // Tecnobrega
  {
    id: 'rule_tecnobrega_bass',
    name: 'Baixo Tecnobrega',
    description: {
      pt: 'Linha de baixo eletrônico pesado do Tecnobrega.',
      en: 'Heavy electronic bass line of Tecnobrega.'
    },
    source: 'brega_tradition' as const,
    bass_degree: 0,
    voicing: [0, 12],
    forbidden_intervals: [],
    regional_adaptation: {
      genre: 'tecnobrega',
      modification: 'Oitavas com decay sintetizado 808',
      practice_note: 'Usar samples de TR-808 ou sintetizadores modernos'
    }
  }
];

// ============================================================================
// DATA - COUNTERPOINT RULES (Dufay)
// ============================================================================

const COUNTERPOINT_RULES = [
  {
    id: 'rule_no_parallel_fifths',
    name: 'Proibir Quintas Paralelas',
    species: 1,
    description: {
      pt: 'Movimento de quintas paralelas entre vozes é proibido.',
      en: 'Parallel fifths movement between voices is forbidden.'
    },
    forbidden_movements: ['parallel_fifths', 'parallel_octaves'],
    required_resolutions: ['contrary_motion', 'oblique_motion'],
    regional_exceptions: null
  },
  {
    id: 'rule_no_parallel_octaves',
    name: 'Proibir Oitavas Paralelas',
    species: 1,
    description: {
      pt: 'Movimento de oitavas paralelas entre vozes é proibido.',
      en: 'Parallel octaves movement between voices is forbidden.'
    },
    forbidden_movements: ['parallel_octaves', 'direct_fifths_to_perfect'],
    required_resolutions: ['contrary_motion'],
    regional_exceptions: null
  },
  {
    id: 'rule_resolve_seventh',
    name: 'Resolver Sétima Descendente',
    species: 2,
    description: {
      pt: 'A sétima do acorde de dominante deve resolver descendentemente.',
      en: 'The seventh of dominant chord must resolve downward.'
    },
    forbidden_movements: ['seventh_ascending'],
    required_resolutions: ['seventh_downward_step'],
    regional_exceptions: {
      genre: 'brega',
      allowed_movements: ['seventh_delayed_resolution', 'seventh_suspension']
    }
  },
  {
    id: 'rule_resolve_diminished',
    name: 'Resolver Acorde Diminuto',
    species: 1,
    description: {
      pt: 'O traço diminuto resolve movendo-se ascendente.',
      en: 'Diminished fifth resolves by moving upward.'
    },
    forbidden_movements: ['diminished_parallel'],
    required_resolutions: ['diminished_upward'],
    regional_exceptions: null
  },
  {
    id: 'rule_raise_leading_tone',
    name: 'Elevar a Sensível',
    species: 1,
    description: {
      pt: 'A sensível (sétimo grau) deve resolver ascendente ao tônico.',
      en: 'The leading tone (7th degree) must resolve upward to tonic.'
    },
    forbidden_movements: ['leading_tone_downward'],
    required_resolutions: ['leading_tone_upward'],
    regional_exceptions: {
      genre: 'brega',
      allowed_movements: ['leading_tone_delayed', 'leading_tone_romantic_exception']
    }
  }
];

// ============================================================================
// DATA - GENRE TEMPLATES
// ============================================================================

const GENRE_TEMPLATES = [
  {
    id: 'template_brega_romantico',
    name: 'Brega Romântico',
    category: 'brega' as const,
    tempo_range: {min: 85, max: 105},
    time_signature: {numerator: 4, denominator: 4},
    typical_keys: ['C', 'G', 'F', 'Eb', 'Bb'],
    partimento_schema: 'Rule_of_Octave_Modified',
    harmonic_rules: ['rule_brega_cadence', 'rule_brega_suspension'],
    groove_template: {
      swing: 0.0,
      accent_pattern: [1, 0.5, 0.8, 0.5],
      micro_timing: [0, -10, 0, -10]
    },
    typical_instrumentation: {
      rhythm: ['inst_bass_drum', 'inst_snare_drum'],
      harmony: ['inst_piano', 'inst_organ', 'inst_xps10_pads'],
      melody: ['inst_saxophone', 'inst_trumpet', 'inst_xps10_leads'],
      bass: ['inst_xps10_pads', 'inst_double_bass']
    },
    mix_template: {
      reverb_damp: 2000,
      compression_ratio: 4,
      stereo_width: 80,
      bass_boost: 3
    },
    cultural_references: [
      'Melodias românticas com temas de amor e saudade',
      'Arranjos luxuriantes com metais e cordas',
      'Produção emocional com dramaticidade'
    ],
    representative_artists: [
      'Waldick Soriano',
      'Regina Célia',
      'Odair Jose',
      'Erasmo Carlos'
    ]
  },
  {
    id: 'template_forro_piseiro',
    name: 'Forró Piseiro',
    category: 'forro' as const,
    tempo_range: {min: 155, max: 175},
    time_signature: {numerator: 2, denominator: 4},
    typical_keys: ['C', 'G', 'D'],
    partimento_schema: 'forro_baião',
    harmonic_rules: ['rule_forro_syncopation', 'rule_forro_bassline'],
    groove_template: {
      swing: 0.35,
      accent_pattern: [1, 0.3, 1, 0.3],
      micro_timing: [0, 50, 0, 50]
    },
    typical_instrumentation: {
      rhythm: ['inst_zabumba', 'inst_triangle'],
      harmony: ['inst_sanfona', 'inst_pifano'],
      melody: ['inst_pifano', 'inst_sanfona', 'inst_flute'],
      bass: ['inst_zabumba', 'inst_xps10_pads']
    },
    mix_template: {
      reverb_damp: 3000,
      compression_ratio: 3,
      stereo_width: 60,
      bass_boost: 6
    },
    cultural_references: [
      'Ritmo acelerado para dança',
      'Letras regionais do Nordeste brasileiro',
      'Instrumentação típica: zabumba, triângulo, sanfona'
    ],
    representative_artists: [
      'Dominguinhos',
      'Luiz Gonzaga',
      'Jackson do Pandeiro',
      'Anastácia'
    ]
  },
  {
    id: 'template_tecnobrega',
    name: 'Tecnobrega',
    category: 'tecnobrega' as const,
    tempo_range: {min: 125, max: 145},
    time_signature: {numerator: 4, denominator: 4},
    typical_keys: ['Cm', 'Gm', 'Dm'],
    partimento_schema: 'tecnobrega_bass',
    harmonic_rules: ['rule_tecnobrega_bass'],
    groove_template: {
      swing: 0.2,
      accent_pattern: [1, 0.7, 0.5, 0.7],
      micro_timing: [0, -20, 0, -20]
    },
    typical_instrumentation: {
      rhythm: ['inst_bass_drum', 'inst_snare_drum'],
      harmony: ['inst_xps10_pads', 'inst_xps10_leads'],
      melody: ['inst_xps10_leads', 'inst_saxophone'],
      bass: ['inst_xps10_pads']
    },
    mix_template: {
      reverb_damp: 1500,
      compression_ratio: 6,
      stereo_width: 100,
      bass_boost: 8
    },
    cultural_references: [
      'Movimento tecnobrega de Belém do Pará',
      'Sintetizadores pesados e baixo 808',
      'Fusão de carimbó com música eletrônica'
    ],
    representative_artists: [
      'Banda Tecno',
      'Apocalipse',
      'Melim',
      'Jorge do Furico'
    ]
  },
  {
    id: 'template_forro_baião',
    name: 'Forró Baião',
    category: 'forro' as const,
    tempo_range: {min: 95, max: 115},
    time_signature: {numerator: 2, denominator: 4},
    typical_keys: ['C', 'G', 'F', 'D'],
    partimento_schema: 'baiao',
    harmonic_rules: ['rule_forro_syncopation'],
    groove_template: {
      swing: 0.25,
      accent_pattern: [1, 0.5, 0.8, 0.5],
      micro_timing: [0, 30, 0, 30]
    },
    typical_instrumentation: {
      rhythm: ['inst_zabumba', 'inst_triangle'],
      harmony: ['inst_sanfona', 'inst_cavaquinho'],
      melody: ['inst_flute', 'inst_sanfona'],
      bass: ['inst_zabumba']
    },
    mix_template: {
      reverb_damp: 2500,
      compression_ratio: 3.5,
      stereo_width: 50,
      bass_boost: 4
    },
    cultural_references: [
      'Gênero criado por Luiz Gonzaga',
      'Binário acentuado característico',
      'Letras sobre a vida do sertanejo'
    ],
    representative_artists: [
      'Luiz Gonzaga',
      'Dominguinhos',
      'Sivuca',
      'Ailton Campos'
    ]
  }
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedMusicTheory(db: admin.firestore.Firestore): Promise<void> {
  const batch = db.batch();
  let count = 0;

  console.log('🎵 Seeding SynKrony Music Theory Database...\n');

  // Seed Scales
  console.log('📝 Scales...');
  for (const scale of SCALES) {
    const ref = db.collection('music_theory').doc('scales').collection('all').doc(scale.id);
    batch.set(ref, scale);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Seed Chords
  console.log('🎸 Chords...');
  for (const chord of CHORDS) {
    const ref = db.collection('music_theory').doc('chords').collection('all').doc(chord.id);
    batch.set(ref, chord);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Seed Progressions
  console.log('🔄 Progressions...');
  for (const prog of PROGRESSIONS) {
    const ref = db.collection('music_theory').doc('progressions').collection('all').doc(prog.id);
    batch.set(ref, prog);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Seed Instruments
  console.log('🎷 Instruments...');
  for (const inst of INSTRUMENTS) {
    const ref = db.collection('music_theory').doc('instruments').collection('all').doc(inst.id);
    batch.set(ref, inst);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Seed Partimento Rules
  console.log('📜 Partimento Rules...');
  for (const rule of PARTIMENTO_RULES) {
    const ref = db.collection('music_theory').doc('partimento_rules').collection('all').doc(rule.id);
    batch.set(ref, rule);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Seed Counterpoint Rules
  console.log('🎼 Counterpoint Rules...');
  for (const rule of COUNTERPOINT_RULES) {
    const ref = db.collection('music_theory').doc('counterpoint_rules').collection('all').doc(rule.id);
    batch.set(ref, rule);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Seed Genre Templates
  console.log('🎭 Genre Templates...');
  for (const template of GENRE_TEMPLATES) {
    const ref = db.collection('synkrony').doc('genre_templates').collection('all').doc(template.id);
    batch.set(ref, template);
    count++;
    if (count % 200 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents`);
    }
  }

  // Commit remaining
  await batch.commit();

  console.log(`\n✅ Seed complete! Total documents: ${count}`);
  console.log('\n📊 Summary:');
  console.log(`  - Scales: ${SCALES.length}`);
  console.log(`  - Chords: ${CHORDS.length}`);
  console.log(`  - Progressions: ${PROGRESSIONS.length}`);
  console.log(`  - Instruments: ${INSTRUMENTS.length}`);
  console.log(`  - Partimento Rules: ${PARTIMENTO_RULES.length}`);
  console.log(`  - Counterpoint Rules: ${COUNTERPOINT_RULES.length}`);
  console.log(`  - Genre Templates: ${GENRE_TEMPLATES.length}`);
}

// Export for use in callable function
export {seedMusicTheory};
