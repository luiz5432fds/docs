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
// MAESTRO IA - Musical Production Assistant Types
// ============================================================================

export type AudioSource = {
  type: 'youtube' | 'whatsapp' | 'upload' | 'url';
  url?: string;
  messageId?: string;
  filename?: string;
};

export type MusicalAnalysis = {
  bpm: number;
  key: string;
  timeSignature: string;
  chords: ChordProgression;
  melody: MelodyContour;
  sections: SongSection[];
  instruments: DetectedInstrument[];
  duration: number;
};

export type ChordProgression = {
  chords: ChordEvent[];
  key: string;
  scaleType: 'major' | 'minor' | 'harmonic_minor' | 'melodic_minor';
};

export type ChordEvent = {
  chord: string;
  startBeat: number;
  durationBeats: number;
  inversion?: number;
  alterations?: string[];
};

export type MelodyContour = {
  notes: MelodyNote[];
  range: {lowest: number; highest: number};
  tessitura: string;
};

export type MelodyNote = {
  pitch: number; // MIDI note number
  startBeat: number;
  durationBeats: number;
  velocity: number;
};

export type SongSection = {
  type: 'intro' | 'verse' | 'pre_chorus' | 'chorus' | 'bridge' | 'solo' | 'outro';
  startBeat: number;
  endBeat: number;
  label: string;
};

export type DetectedInstrument = {
  type: string;
  confidence: number;
  role: 'melody' | 'harmony' | 'bass' | 'drums' | 'percussion';
};

export type ArrangementStyle =
  | 'bossa_nova'
  | 'jazz'
  | 'mpb'
  | 'pop'
  | 'rock'
  | 'samba'
  | 'forro'
  | 'classical'
  | 'electronic'
  | 'funk';

export type ArrangementInstrument = {
  name: string;
  midiChannel: number;
  role: string;
  settings: Record<string, unknown>;
};

export type MusicalArrangement = {
  style: ArrangementStyle;
  instruments: ArrangementInstrument[];
  structure: SongSection[];
  harmony: ChordProgression;
  tempo: number;
  timeSignature: string;
  key: string;
};

export type MaestroIntent =
  | 'composicao'
  | 'arranjo'
  | 'producao'
  | 'analise'
  | 'transcricao';

export type MaestroProject = {
  id: string;
  userId: string;
  status: 'processing' | 'analyzing' | 'arranging' | 'generating' | 'exporting' | 'completed' | 'error';
  intent: MaestroIntent;
  audioSource?: AudioSource;
  analysis?: MusicalAnalysis;
  arrangement?: MusicalArrangement;
  prompt: string;
  progress: MaestroProgress;
  exports?: ExportOptions;
  createdAt: number;
  updatedAt: number;
};

export type MaestroProgress = {
  currentStep: string;
  completedSteps: string[];
  percentage: number;
  message: string;
  logs: ProgressLog[];
};

export type ProgressLog = {
  timestamp: number;
  step: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
};

export type ExportOptions = {
  reaperProject: boolean;
  audioStems: boolean;
  midiFile: boolean;
  musicXml: boolean;
  pdfScore: boolean;
  formats: string[];
};

export type ExportResult = {
  reaperProject?: string; // Path to .rpp file
  audioStems?: string[]; // Paths to stem files
  midiFile?: string; // Path to .mid file
  musicXml?: string; // Path to .musicxml file
  pdfScore?: string; // Path to .pdf file
  downloadUrl?: string; // ZIP download URL
};
