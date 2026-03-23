// ============================================================================
// EXISTING TYPES - XPS-10 Patch System
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
// SYNKRONY - Music Theory & Production Ecosystem
// ============================================================================

// --------------------------------------------------------------------------
// Core Music Data Types
// --------------------------------------------------------------------------

/**
 * Represents a single musical note with full expression data
 */
export interface NoteData {
  id: string;
  pitch: number;              // MIDI note number (0-127)
  duration: number;           // Ticks (960 = quarter note)
  velocity: number;           // 0-127
  position: number;           // Position in ticks from start
  tieStart?: boolean;         // If true, note ties to next
  tieEnd?: boolean;           // If true, note ties from previous
  articulations?: string[];   // ['staccato', 'legato', 'accent', etc]
  ornaments?: string[];       // ['trill', 'mordent', 'turn', etc]
  partimento_degree?: number; // Scale degree (0-6) for Partimento
}

/**
 * Dynamic marking at a specific position
 */
export interface DynamicData {
  position: number;
  symbol: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff';
  velocity: number;
}

/**
 * Articulation applied at a specific position
 */
export interface ArticulationData {
  type: 'staccato' | 'legato' | 'accent' | 'marcato' | 'tenuto' | 'fermata';
  position: number;
  intensity?: number;         // 0-1, default 0.5
}

/**
 * Voicing options for chords
 */
export interface Voicing {
  name: string;               // e.g., "Root Position", "First Inversion"
  notes: number[];            // Intervals above bass
  style: string;              // "aberto", "fechado", "drop2", "drop3"
  regional_style?: string;    // "brega", "forro", etc.
}

/**
 * Partimento harmony rule
 */
export interface PartimentoRule {
  bass_degree: number;        // Scale degree (0-6)
  voicing: number[];          // Suggested notes above bass
  forbidden_intervals?: number[]; // Intervals to avoid
  regional_exception?: string; // Adaptation for regional styles
}

/**
 * Counterpoint rule following species
 */
export interface CounterpointRule {
  species: number;            // 1-5 (Fux species)
  forbidden_movements: string[];
  required_resolutions: string[];
}

/**
 * Section of an arrangement
 */
export interface SectionData {
  id: string;
  name: string;               // "Verse", "Refrão", "Ponte", "Solo"
  bars: {start: number; end: number};
  tempo?: number;
  keySignature?: string;
  instruments: string[];
  dynamics: string;
  partimento_degree?: number; // Scale degree for this section
}

/**
 * Instrument in an arrangement
 */
export interface InstrumentData {
  instrumentId: string;
  count: number;
  divisi?: string[];          // For divisi sections
}

// --------------------------------------------------------------------------
// Music Theory - Scales
// --------------------------------------------------------------------------

export interface Scale {
  id: string;
  name: {pt: string; en: string};
  root: number;               // 0-11 (C=0, B=11)
  intervals: number[];        // [0,2,4,5,7,9,11] for major
  type: 'major' | 'minor' | 'pentatonic' | 'modal' | 'exotic' | 'blues' | 'brega' | 'forro';
  tags: string[];
  chords: string[];           // IDs of diatonic chords
  partimento_rules: PartimentoRule[];
  regional_style?: string;    // "brega", "forro", "tecnobrega"
}

// --------------------------------------------------------------------------
// Music Theory - Chords
// --------------------------------------------------------------------------

export interface Chord {
  id: string;
  name: {pt: string; en: string};
  symbols: string[];          // ["C", "Cmaj7", "CM7"]
  root: number;
  intervals: number[];
  type: 'triad' | 'seventh' | 'extended' | 'altered';
  function?: string;          // "I", "ii", "V7", "viio"
  scales: string[];           // Compatible scale IDs
  voicings: Voicing[];        // Specific voicings for Brega/Forró
  counterpoint_rules: CounterpointRule[];
}

// --------------------------------------------------------------------------
// Music Theory - Progressions
// --------------------------------------------------------------------------

export interface Progression {
  id: string;
  name: {pt: string; en: string};
  chords: string[];           // Chord IDs
  category: 'jazz' | 'pop' | 'classical' | 'blues' | 'brega' | 'forro' | 'tecnobrega';
  description: {pt: string; en: string};
  commonKeys: string[];
  variations?: string[];      // IDs of variations
  partimento_schema: string;  // "Rule_of_Octave", "Rule_of_Octave_Modified"
}

// --------------------------------------------------------------------------
// Music Theory - Instruments
// --------------------------------------------------------------------------

export interface Instrument {
  id: string;
  name: {pt: string; en: string};
  family: 'woodwinds' | 'brass' | 'strings' | 'percussion' | 'keyboard' | 'vocal' | 'synth' | 'regional';
  range: {
    lowest: number;
    highest: number;
    practical: {lowest: number; highest: number};
  };
  transposition: number;      // Semitones from concert pitch
  clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
  midiProgram: number;
  articulations: string[];
  dynamics: {pp: number; ff: number};
  commonIn: string[];
  xps10Category?: string;
  regional_role?: string;     // "baixo_forro", "teclado_brega", etc.
}

// --------------------------------------------------------------------------
// SynKrony Projects
// --------------------------------------------------------------------------

export type GenreType = 'brega_romantico' | 'forro_piseiro' | 'tecnobrega' | 'pop_nacional';

export type ModeType = 'major' | 'minor';

export interface HardwareTarget {
  mm8_connected: boolean;
  xps10_connected: boolean;
  midi_channels: {mm8: number; xps10: number};
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface KeySignature {
  key: string;
  mode: ModeType;
}

export interface SynKronyProject {
  id: string;
  name: string;
  description?: string;

  // Musical configuration
  genre: GenreType;
  bpm: number;
  timeSignature: TimeSignature;
  keySignature: KeySignature;

  // Hardware setup
  hardware_setup: HardwareTarget;

  // DAW integration
  reaper_synced: boolean;
  musescore_synced: boolean;
  reaper_project_path?: string;
  musescore_score_path?: string;

  // Partimento
  partimento_enabled: boolean;
  partimento_schema: string;

  // Metadata
  tags: string[];
  mood?: string;

  // Timestamps
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  lastSyncAt?: FirebaseFirestore.FieldValue;
}

// --------------------------------------------------------------------------
// Tracks within Projects
// --------------------------------------------------------------------------

export type HardwareDeviceTarget = 'mm8' | 'xps10' | 'vst' | 'none';

export type TrackGenerator = 'user' | 'partimento' | 'counterpoint';

export interface RegionalStyle {
  groove_template: string;
  swing_amount: number;
  accent_pattern: number[];
}

export interface SendData {
  target: string;
  amount: number;
}

export interface SynKronyTrack {
  id: string;
  name: string;
  instrument: string;
  instrumentId: string;
  hardware_target: HardwareDeviceTarget;

  // MIDI
  midiChannel: number;
  midiProgram?: number;

  // Notes generated by Partimento
  notes: NoteData[];
  generated_by: TrackGenerator;

  // Expression
  dynamics: DynamicData[];
  articulations: ArticulationData[];

  // Mix
  volume: number;
  pan: number;
  sends: SendData[];

  // Regional adaptations
  regional_style?: RegionalStyle;
}

// --------------------------------------------------------------------------
// Scores (Partituras)
// --------------------------------------------------------------------------

export interface PartData {
  id: string;
  name: string;
  instrumentId: string;
  notes: NoteData[];
}

export interface MeasureData {
  number: number;
  timeSignature: TimeSignature;
  keySignature: KeySignature;
  tempo?: number;
}

export interface Score {
  id: string;
  projectId?: string;
  title: string;
  composer?: string;
  arranger?: string;
  genre?: string;

  // Structure
  parts: PartData[];
  measures: MeasureData[];

  // Partimento
  partimento_bass: NoteData[];
  realization_rules: string[];

  // Export
  musicXmlUrl?: string;
  pdfUrl?: string;
  midiUrl?: string;

  // Metadata
  tempo: number;
  keySignature: string;
  timeSignature: string;

  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
}

// --------------------------------------------------------------------------
// Arrangements
// --------------------------------------------------------------------------

export type DensityType = 'thin' | 'medium' | 'thick';

export type ArrangementGenre = 'brega' | 'forro' | 'tecnobrega' | 'pop';

export interface PartimentoRealization {
  bass_line: NoteData[];
  harmonic_progression: string[];
  counterpoint_voices: NoteData[][];
}

export interface Arrangement {
  id: string;
  name: string;
  sourceMaterial?: string;

  // Structure
  structure: SectionData[];
  instrumentation: InstrumentData[];

  // Regional style
  style: string;
  genre: ArrangementGenre;
  density: DensityType;

  // Partimento applied
  partimento_realization: PartimentoRealization;

  // Metadata
  createdAt: FirebaseFirestore.FieldValue;
  isPublic: boolean;
}

// --------------------------------------------------------------------------
// Hardware Configurations
// --------------------------------------------------------------------------

export interface Mm8Config {
  midi_channel: number;
  master_clock: boolean;
  transport_control: boolean;
  cc_mappings: Record<string, number>;
}

export interface Xps10Config {
  midi_channel: number;
  local_control: boolean;
  sysex_enabled: boolean;
  cc_mappings: Record<string, number>;
  preset_banks: string[];
}

export type SyncMode = 'internal' | 'mm8_master' | 'reaper_master';

export interface HardwareConfig {
  id: string;
  name: string;

  // Yamaha MM8
  mm8_config: Mm8Config;

  // Roland XPS-10
  xps10_config: Xps10Config;

  // Synchronization
  sync_mode: SyncMode;

  createdAt: FirebaseFirestore.FieldValue;
}

// --------------------------------------------------------------------------
// Hardware Presets (Public)
// --------------------------------------------------------------------------

export type HardwareDevice = 'mm8' | 'xps10' | 'both';

export interface HardwarePreset {
  id: string;
  name: string;
  device: HardwareDevice;
  category: string;

  // SysEx dumps
  sysex_data: string[];

  // Mapped parameters
  parameters: Record<string, number>;

  // Regional style
  regional_style: string;

  isPublic: boolean;
}

// --------------------------------------------------------------------------
// Genre Templates (Public)
// --------------------------------------------------------------------------

export interface GrooveTemplate {
  swing: number;
  accent_pattern: number[];
  micro_timing: number[];
}

export interface TypicalInstrumentation {
  rhythm: string[];
  harmony: string[];
  melody: string[];
  bass: string[];
}

export interface MixTemplate {
  reverb_damp: number;
  compression_ratio: number;
  stereo_width: number;
  bass_boost: number;
}

export type TemplateCategory = 'brega' | 'forro' | 'tecnobrega';

export interface GenreTemplate {
  id: string;
  name: string;
  category: TemplateCategory;

  // Musical characteristics
  tempo_range: {min: number; max: number};
  time_signature: TimeSignature;
  typical_keys: string[];

  // Partimento adapted
  partimento_schema: string;
  harmonic_rules: string[];

  // Groove and feel
  groove_template: GrooveTemplate;

  // Typical instrumentation
  typical_instrumentation: TypicalInstrumentation;

  // Characteristic mix
  mix_template: MixTemplate;

  // Cultural references
  cultural_references: string[];
  representative_artists: string[];
}

// --------------------------------------------------------------------------
// Partimento Rules (in Firestore)
// --------------------------------------------------------------------------

export interface PartimentoRuleDocument {
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
}

// --------------------------------------------------------------------------
// Counterpoint Rules (in Firestore)
// --------------------------------------------------------------------------

export interface CounterpointRuleDocument {
  id: string;
  name: string;
  species: number;
  description: {pt: string; en: string};
  forbidden_movements: string[];
  required_resolutions: string[];
  regional_exceptions?: {
    genre: string;
    allowed_movements: string[];
  };
}

// ============================================================================
// POSTGRESQL - Analytics Types
// ============================================================================

export interface UsageMetric {
  id: string;
  uid: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PatchAnalytics {
  id: string;
  patch_id: string;
  uid: string;
  views: number;
  likes: number;
  forks: number;
  created_at: Date;
  updated_at: Date;
}

export interface AiLog {
  id: string;
  uid: string;
  agent_type: string;
  input: string;
  output: any;
  latency_ms: number;
  timestamp: Date;
}

export interface PnabMetric {
  id: string;
  project_id: string;
  cultural_impact: number;      // 0-100 score
  regional_preservation: number; // 0-100 score
  community_beneficiaries: number;
  timestamp: Date;
}

// ============================================================================
// Helper Types
// ============================================================================

declare namespace FirebaseFirestore {
  type FieldValue = any;
}
