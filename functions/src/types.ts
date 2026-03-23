// ============================================================================
// EXISTING TYPES (Preserved)
// ============================================================================

export type Macro = {
  brightness: number;
  bite: number;
  warmth: number;
  width: number;
  dirt: number;
  air: number;
};

export type Panel = {
  cutoff: number;
  resonance: number;
  attack: number;
  release: number;
  chorus: number;
  reverb: number;
};

export type PatchDraft = {
  name: string;
  category: string;
  tags: string[];
  macro: Macro;
  panel: Panel;
  mixHints: string[];
  recipeSteps: string[];
  variants: Record<string, {macro: Macro; panel: Panel}>;
};

// ============================================================================
// MUSICAL NOTE DATA TYPES
// ============================================================================

export type NoteData = {
  id: string;
  pitch: number;           // MIDI note (0-127)
  duration: number;        // Ticks (960 = semínima)
  velocity: number;        // 0-127
  position: number;
  tieStart?: boolean;
  tieEnd?: boolean;
  articulations?: string[];
  ornaments?: string[];
  partimento_degree?: number;  // Grau no partimento
};

export type DynamicData = {
  position: number;
  symbol: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff';
  velocity: number;
};

export type ArticulationData = {
  type: 'staccato' | 'legato' | 'accent' | 'marcato' | 'tenuto' | 'fermata';
  position: number;
  intensity?: number;
};

// ============================================================================
// MUSIC THEORY TYPES
// ============================================================================

export type ScaleType =
  | 'major'
  | 'minor'
  | 'pentatonic'
  | 'modal'
  | 'exotic'
  | 'blues'
  | 'brega'
  | 'forro';

export type MusicScale = {
  id: string;
  name: {pt: string; en: string};
  root: number;           // 0-11 (C=0, B=11)
  intervals: number[];    // [0,2,4,5,7,9,11]
  type: ScaleType;
  tags: string[];
  chords: string[];       // IDs dos acordes diatônicos
  partimento_rules: PartimentoRule[];
  regional_style?: string; // 'brega', 'forro', etc.
};

export type ChordType = 'triad' | 'seventh' | 'extended' | 'altered';

export type MusicChord = {
  id: string;
  name: {pt: string; en: string};
  symbols: string[];
  root: number;
  intervals: number[];
  type: ChordType;
  function?: string;      // 'I', 'ii', 'V7', 'viio'
  scales: string[];
  voicings: Voicing[];
  counterpoint_rules: CounterpointRule[];
};

export type Voicing = {
  name: string;
  notes: number[];  // Intervalos acima do baixo
  style: string;    // 'aberto', 'fechado', 'drop2'
  regional_style?: string;
};

export type ProgressionCategory =
  | 'jazz'
  | 'pop'
  | 'classical'
  | 'blues'
  | 'brega'
  | 'forro'
  | 'tecnobrega';

export type MusicProgression = {
  id: string;
  name: {pt: string; en: string};
  chords: string[];
  category: ProgressionCategory;
  description: {pt: string; en: string};
  commonKeys: string[];
  variations?: string[];
  partimento_schema: string;  // 'Rule_of_Octave', 'Rule_of_Octave_Modified'
};

export type InstrumentFamily =
  | 'woodwinds'
  | 'brass'
  | 'strings'
  | 'percussion'
  | 'keyboard'
  | 'vocal'
  | 'synth'
  | 'regional';

export type Clef = 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';

export type InstrumentRange = {
  lowest: number;
  highest: number;
  practical: {lowest: number; highest: number};
};

export type DynamicsRange = {
  pp: number;
  ff: number;
};

export type MusicInstrument = {
  id: string;
  name: {pt: string; en: string};
  family: InstrumentFamily;
  range: InstrumentRange;
  transposition: number;
  clef: Clef;
  midiProgram: number;
  articulations: string[];
  dynamics: DynamicsRange;
  commonIn: string[];
  xps10Category?: string;
  regional_role?: string;  // 'baixo_forro', 'teclado_brega', etc.
};

// ============================================================================
// PARTIMENTO & COUNTERPOINT TYPES
// ============================================================================

export type PartimentoRule = {
  bass_degree: number;
  voicing: number[];
  forbidden_intervals?: number[];
  regional_exception?: string;
};

export type PartimentoRuleDoc = {
  id: string;
  name: string;
  description: {pt: string; en: string};
  source: 'dufay' | 'fenaroli' | 'sala' | 'brega_tradition';
  bass_degree: number;
  voicing: number[];
  forbidden_intervals: number[];
  regional_adaptation?: {
    genre: string;
    modification: string;
    practice_note: string;
  };
};

export type CounterpointRule = {
  species: number;
  forbidden_movements: string[];
  required_resolutions: string[];
};

export type CounterpointRuleDoc = {
  id: string;
  name: string;
  species: number;        // 1-5 (especies de Fux)
  description: {pt: string; en: string};
  forbidden_movements: string[];
  required_resolutions: string[];
  regional_exceptions?: {
    genre: string;
    allowed_movements: string[];
  };
};

// ============================================================================
// SYNKRONY PROJECT TYPES
// ============================================================================

export type GenreType =
  | 'brega_romantico'
  | 'forro_piseiro'
  | 'tecnobrega'
  | 'pop_nacional';

export type HardwareSetup = {
  mm8_connected: boolean;
  xps10_connected: boolean;
  midi_channels: {mm8: number; xps10: number};
};

export type TimeSignature = {
  numerator: number;
  denominator: number;
};

export type KeySignature = {
  key: string;
  mode: 'major' | 'minor';
};

export type SynKronyProject = {
  id: string;
  name: string;
  description?: string;
  genre: GenreType;
  bpm: number;
  timeSignature: TimeSignature;
  keySignature: KeySignature;
  hardware_setup: HardwareSetup;
  reaper_synced: boolean;
  musescore_synced: boolean;
  reaper_project_path?: string;
  musescore_score_path?: string;
  partimento_enabled: boolean;
  partimento_schema: string;
  tags: string[];
  mood?: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  lastSyncAt?: FirebaseFirestore.FieldValue;
};

export type HardwareTarget = 'mm8' | 'xps10' | 'vst' | 'none';

export type RegionalStyle = {
  groove_template: string;
  swing_amount: number;
  accent_pattern: number[];
};

export type SendData = {
  bus: string;
  amount: number;
};

export type SynKronyTrack = {
  id: string;
  name: string;
  instrument: string;
  instrumentId: string;
  hardware_target: HardwareTarget;
  midiChannel: number;
  midiProgram?: number;
  notes: NoteData[];
  generated_by: 'user' | 'partimento' | 'counterpoint';
  dynamics: DynamicData[];
  articulations: ArticulationData[];
  volume: number;
  pan: number;
  sends: SendData[];
  regional_style?: RegionalStyle;
};

// ============================================================================
// SCORE & ARRANGEMENT TYPES
// ============================================================================

export type PartData = {
  id: string;
  name: string;
  instrumentId: string;
  notes: NoteData[];
};

export type MeasureData = {
  number: number;
  timeSignature: TimeSignature;
  keySignature: KeySignature;
  tempo?: number;
};

export type Score = {
  id: string;
  projectId?: string;
  title: string;
  composer?: string;
  arranger?: string;
  genre?: string;
  parts: PartData[];
  measures: MeasureData[];
  partimento_bass: NoteData[];
  realization_rules: string[];
  musicXmlUrl?: string;
  pdfUrl?: string;
  midiUrl?: string;
  tempo: number;
  keySignature: string;
  timeSignature: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
};

export type InstrumentData = {
  instrumentId: string;
  count: number;
  divisi?: string[];
};

export type SectionData = {
  id: string;
  name: string;  // 'Verse', 'Refrão', 'Ponte', 'Solo'
  bars: {start: number; end: number};
  tempo?: number;
  keySignature?: string;
  instruments: string[];
  dynamics: string;
  partimento_degree?: number;
};

export type DensityType = 'thin' | 'medium' | 'thick';

export type PartimentoRealization = {
  bass_line: NoteData[];
  harmonic_progression: string[];
  counterpoint_voices: NoteData[][];
};

export type Arrangement = {
  id: string;
  name: string;
  sourceMaterial?: string;
  structure: SectionData[];
  instrumentation: InstrumentData[];
  style: string;
  genre: 'brega' | 'forro' | 'tecnobrega' | 'pop';
  density: DensityType;
  partimento_realization: PartimentoRealization;
  createdAt: FirebaseFirestore.FieldValue;
  isPublic: boolean;
};

export type ArrangementSection = {
  id: string;
  name: string;
  bars: {start: number; end: number};
  tempo?: number;
  keySignature?: string;
  instruments: string[];
  dynamics: string;
  partimento_degree?: number;
};

// ============================================================================
// HARDWARE CONFIG TYPES
// ============================================================================

export type MM8Config = {
  midi_channel: number;
  master_clock: boolean;
  transport_control: boolean;
  cc_mappings: Record<string, number>;
};

export type XPS10Config = {
  midi_channel: number;
  local_control: boolean;
  sysex_enabled: boolean;
  cc_mappings: Record<string, number>;
  preset_banks: string[];
};

export type SyncMode = 'internal' | 'mm8_master' | 'reaper_master';

export type HardwareConfig = {
  id: string;
  name: string;
  mm8_config: MM8Config;
  xps10_config: XPS10Config;
  sync_mode: SyncMode;
  createdAt: FirebaseFirestore.FieldValue;
};

export type HardwarePreset = {
  id: string;
  name: string;
  device: 'mm8' | 'xps10' | 'both';
  category: string;
  sysex_data: string[];
  parameters: Record<string, number>;
  regional_style: string;
  isPublic: boolean;
};

// ============================================================================
// GENRE TEMPLATE TYPES
// ============================================================================

export type TempoRange = {
  min: number;
  max: number;
};

export type GrooveTemplate = {
  swing: number;
  accent_pattern: number[];
  micro_timing: number[];
};

export type TypicalInstrumentation = {
  rhythm: string[];
  harmony: string[];
  melody: string[];
  bass: string[];
};

export type MixTemplate = {
  reverb_damp: number;
  compression_ratio: number;
  stereo_width: number;
  bass_boost: number;
};

export type GenreTemplate = {
  id: string;
  name: string;
  category: 'brega' | 'forro' | 'tecnobrega';
  tempo_range: TempoRange;
  time_signature: TimeSignature;
  typical_keys: string[];
  partimento_schema: string;
  harmonic_rules: string[];
  groove_template: GrooveTemplate;
  typical_instrumentation: TypicalInstrumentation;
  mix_template: MixTemplate;
  cultural_references: string[];
  representative_artists: string[];
};

// ============================================================================
// ANALYTICS TYPES (PostgreSQL)
// ============================================================================

export type UsageMetric = {
  id: string;
  uid: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
};

export type PatchAnalytics = {
  id: string;
  patch_id: string;
  uid: string;
  category: string;
  tags: string[];
  likes: number;
  forks: number;
  created_at: Date;
  updated_at: Date;
};

export type AILog = {
  id: string;
  uid: string;
  agent: string;
  input: string;
  output: Record<string, unknown>;
  latency_ms: number;
  timestamp: Date;
};

export type PNABMetric = {
  id: string;
  project_id: string;
  cultural_impact: number;
  regional_preservation: number;
  community_beneficiaries: number;
  timestamp: Date;
};
