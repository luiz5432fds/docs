import {
  ArrangementStyle,
  ArrangementInstrument,
  MusicalArrangement,
  SongSection,
  ChordProgression,
  MusicalAnalysis,
} from '../types';

export interface ArrangementGenerationParams {
  style: ArrangementStyle;
  key: string;
  tempo: number;
  timeSignature: string;
  sections?: SongSection[];
  customInstruments?: string[];
}

/**
 * Arrangement Agent
 * Creates instrumental distribution and arrangement structure
 */
export async function arrangementAgent(
  analysis?: MusicalAnalysis,
  params?: ArrangementGenerationParams
): Promise<{
  arrangement?: MusicalArrangement;
  suggestions: string[];
  instrumentRoles: Record<string, string>;
}> {
  // If analysis is provided, create arrangement based on detected instruments
  if (analysis && params) {
    return createArrangementFromAnalysis(analysis, params);
  }

  // If only params provided, create arrangement from scratch
  if (params) {
    return createArrangementFromParams(params);
  }

  // Default response
  return {
    suggestions: [
      'For analysis-based arrangement: provide both analysis and params',
      'For scratch arrangement: specify style, key, and tempo',
    ],
    instrumentRoles: {},
  };
}

/**
 * Create arrangement based on audio analysis
 */
function createArrangementFromAnalysis(
  analysis: MusicalAnalysis,
  params: ArrangementGenerationParams
) {
  const {style, key, tempo, timeSignature, sections} = params;

  // Get standard instrumentation for style
  const instruments = getInstrumentationForStyle(style);

  // Create section structure if not provided
  const arrangementSections = sections || analysis.sections || getDefaultSections(style);

  const arrangement: MusicalArrangement = {
    style,
    instruments,
    structure: arrangementSections,
    harmony: analysis.chords || {
      chords: [],
      key,
      scaleType: 'major',
    },
    tempo,
    timeSignature,
    key,
  };

  const suggestions = getStyleSpecificSuggestions(style);
  const instrumentRoles = getInstrumentRoles(instruments);

  return {
    arrangement,
    suggestions,
    instrumentRoles,
  };
}

/**
 * Create arrangement from scratch (no analysis)
 */
function createArrangementFromParams(params: ArrangementGenerationParams) {
  const {style, key, tempo, timeSignature, sections, customInstruments} = params;

  // Get standard or custom instrumentation
  const instruments = customInstruments
    ? createCustomInstruments(customInstruments)
    : getInstrumentationForStyle(style);

  const arrangementSections = sections || getDefaultSections(style);

  const arrangement: MusicalArrangement = {
    style,
    instruments,
    structure: arrangementSections,
    harmony: {
      chords: [],
      key,
      scaleType: 'major',
    },
    tempo,
    timeSignature,
    key,
  };

  const suggestions = getStyleSpecificSuggestions(style);
  const instrumentRoles = getInstrumentRoles(instruments);

  return {
    arrangement,
    suggestions,
    instrumentRoles,
  };
}

/**
 * Get standard instrumentation for each style
 */
function getInstrumentationForStyle(style: ArrangementStyle): ArrangementInstrument[] {
  const instrumentConfigs: Record<ArrangementStyle, ArrangementInstrument[]> = {
    bossa_nova: [
      {name: 'Acoustic Piano', midiChannel: 0, role: 'harmony', settings: {program: 0}},
      {name: 'Acoustic Guitar (Nylon)', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 24}},
      {name: 'Upright Bass', midiChannel: 2, role: 'bass', settings: {program: 32}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Percussion (Pandeiro)', midiChannel: 10, role: 'percussion', settings: {program: 0}},
    ],

    jazz: [
      {name: 'Grand Piano', midiChannel: 0, role: 'harmony', settings: {program: 0}},
      {name: 'Upright Bass', midiChannel: 2, role: 'bass', settings: {program: 32}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Tenor Sax', midiChannel: 1, role: 'melody', settings: {program: 66}},
      {name: 'Trumpet', midiChannel: 3, role: 'melody_harmony', settings: {program: 56}},
    ],

    mpb: [
      {name: 'Acoustic Piano', midiChannel: 0, role: 'harmony', settings: {program: 0}},
      {name: 'Acoustic Guitar (Nylon)', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 24}},
      {name: 'Electric Bass (Finger)', midiChannel: 2, role: 'bass', settings: {program: 33}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Percussion Set', midiChannel: 10, role: 'percussion', settings: {program: 0}},
      {name: 'Strings Ensemble', midiChannel: 3, role: 'pad', settings: {program: 48}},
      {name: 'Flute', midiChannel: 4, role: 'melody', settings: {program: 73}},
    ],

    pop: [
      {name: 'Grand Piano', midiChannel: 0, role: 'harmony', settings: {program: 0}},
      {name: 'Electric Guitar (Clean)', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 27}},
      {name: 'Electric Bass (Finger)', midiChannel: 2, role: 'bass', settings: {program: 33}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Synth Lead', midiChannel: 3, role: 'melody', settings: {program: 80}},
      {name: 'Strings Ensemble', midiChannel: 4, role: 'pad', settings: {program: 48}},
    ],

    rock: [
      {name: 'Electric Guitar (Overdriven)', midiChannel: 0, role: 'harmony_rhythm', settings: {program: 28}},
      {name: 'Electric Guitar (Distorted)', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 29}},
      {name: 'Electric Bass (Pick)', midiChannel: 2, role: 'bass', settings: {program: 34}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Rock Organ', midiChannel: 3, role: 'harmony', settings: {program: 16}},
    ],

    samba: [
      {name: 'Acoustic Piano', midiChannel: 0, role: 'harmony', settings: {program: 0}},
      {name: 'Cavaquinho', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 24}},
      {name: 'Electric Bass (Finger)', midiChannel: 2, role: 'bass', settings: {program: 33}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Percussion (Surdo)', midiChannel: 10, role: 'percussion', settings: {program: 0}},
      {name: 'Percussion (Agogo)', midiChannel: 11, role: 'percussion', settings: {program: 0}},
      {name: 'Trumpet Section', midiChannel: 3, role: 'melody', settings: {program: 60}},
    ],

    forro: [
      {name: 'Accordion', midiChannel: 0, role: 'melody_harmony', settings: {program: 21}},
      {name: 'Acoustic Guitar (Nylon)', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 24}},
      {name: 'Electric Bass (Finger)', midiChannel: 2, role: 'bass', settings: {program: 33}},
      {name: 'Zabumba', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Triangle', midiChannel: 10, role: 'percussion', settings: {program: 0}},
    ],

    classical: [
      {name: 'Grand Piano', midiChannel: 0, role: 'harmony_melody', settings: {program: 0}},
      {name: 'String Ensemble 1', midiChannel: 1, role: 'harmony_pad', settings: {program: 48}},
      {name: 'String Ensemble 2', midiChannel: 2, role: 'harmony_pad', settings: {program: 48}},
    ],

    electronic: [
      {name: 'Synth Lead', midiChannel: 0, role: 'melody', settings: {program: 80}},
      {name: 'Synth Pad', midiChannel: 1, role: 'pad', settings: {program: 88}},
      {name: 'Synth Bass', midiChannel: 2, role: 'bass', settings: {program: 38}},
      {name: 'Drum Machine', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Arpeggiator Synth', midiChannel: 3, role: 'arpeggio', settings: {program: 81}},
    ],

    funk: [
      {name: 'Electric Guitar (Funk)', midiChannel: 0, role: 'harmony_rhythm', settings: {program: 27}},
      {name: 'Electric Bass (Slap)', midiChannel: 2, role: 'bass', settings: {program: 36}},
      {name: 'Drum Set', midiChannel: 9, role: 'drums', settings: {program: 0}},
      {name: 'Clavinet', midiChannel: 1, role: 'harmony_rhythm', settings: {program: 7}},
      {name: 'Brass Section', midiChannel: 3, role: 'hits', settings: {program: 60}},
      {name: 'Synth Lead', midiChannel: 4, role: 'melody', settings: {program: 80}},
    ],
  };

  return instrumentConfigs[style] || instrumentConfigs.pop;
}

/**
 * Create custom instruments from list
 */
function createCustomInstruments(names: string[]): ArrangementInstrument[] {
  return names.map((name, index) => ({
    name,
    midiChannel: index,
    role: 'melody',
    settings: {program: 0},
  }));
}

/**
 * Get default song sections for each style
 */
function getDefaultSections(style: ArrangementStyle): SongSection[] {
  let beatCount = 0;

  const createSection = (type: SongSection['type'], bars: number, label: string): SongSection => {
    const section = {
      type,
      startBeat: beatCount,
      endBeat: beatCount + bars * 4,
      label,
    };
    beatCount += bars * 4;
    return section;
  };

  switch (style) {
    case 'bossa_nova':
    case 'mpb':
      return [
        createSection('intro', 4, 'Intro'),
        createSection('verse', 8, 'Verso 1'),
        createSection('chorus', 8, 'Refrão'),
        createSection('verse', 8, 'Verso 2'),
        createSection('chorus', 8, 'Refrão'),
        createSection('solo', 16, 'Solo'),
        createSection('chorus', 8, 'Refrão Final'),
        createSection('outro', 4, 'Final'),
      ];

    case 'jazz':
      return [
        createSection('intro', 4, 'Intro'),
        createSection('verse', 16, 'Head'),
        createSection('solo', 32, 'Solos'),
        createSection('verse', 16, 'Head'),
        createSection('outro', 4, 'Ending'),
      ];

    case 'pop':
    case 'rock':
      return [
        createSection('intro', 4, 'Intro'),
        createSection('verse', 8, 'Verse 1'),
        createSection('pre_chorus', 4, 'Pre-Chorus'),
        createSection('chorus', 8, 'Chorus'),
        createSection('verse', 8, 'Verse 2'),
        createSection('pre_chorus', 4, 'Pre-Chorus'),
        createSection('chorus', 8, 'Chorus'),
        createSection('bridge', 8, 'Bridge'),
        createSection('chorus', 8, 'Chorus'),
        createSection('outro', 4, 'Outro'),
      ];

    case 'samba':
    case 'forro':
      return [
        createSection('intro', 4, 'Intro'),
        createSection('verse', 8, 'Parte A'),
        createSection('chorus', 8, 'Parte B'),
        createSection('verse', 8, 'Parte A'),
        createSection('chorus', 8, 'Parte B'),
        createSection('solo', 16, 'Solo'),
        createSection('chorus', 8, 'Final'),
      ];

    case 'electronic':
      return [
        createSection('intro', 16, 'Intro'),
        createSection('verse', 16, 'Build'),
        createSection('chorus', 32, 'Drop'),
        createSection('verse', 16, 'Breakdown'),
        createSection('chorus', 32, 'Drop'),
        createSection('outro', 16, 'Outro'),
      ];

    default:
      return [
        createSection('intro', 4, 'Intro'),
        createSection('verse', 8, 'Verse'),
        createSection('chorus', 8, 'Chorus'),
        createSection('verse', 8, 'Verse'),
        createSection('chorus', 8, 'Chorus'),
        createSection('outro', 4, 'Outro'),
      ];
  }
}

/**
 * Get style-specific arrangement suggestions
 */
function getStyleSpecificSuggestions(style: ArrangementStyle): string[] {
  const suggestions: Record<ArrangementStyle, string[]> = {
    bossa_nova: [
      'Use syncopated guitar rhythms as foundation',
      'Piano should play sparse chords (shell voicings)',
      'Bass plays walking lines or simple patterns',
      'Add percussion layers (pandeiro, shaker)',
      'Keep dynamics moderate - bossa is intimate',
    ],

    jazz: [
      'Piano: use shell voicings (3rd and 7th)',
      'Bass: walking lines with quarter notes',
      'Drums: swing pattern with ride cymbal',
      'Horn sections: unison lines and harmony',
      'Leave space for improvisation',
    ],

    mpb: [
      'Combine Brazilian rhythms with sophisticated harmony',
      'Guitar often plays the foundational rhythm',
      'Strings add emotional depth in choruses',
      'Percussion: use authentic Brazilian instruments',
      'Vocal-like melodies for authentic feel',
    ],

    pop: [
      'Keep arrangement clean and focused',
      'Hook in chorus should be prominent',
      'Build energy from verse to chorus',
      'Use pads for atmosphere',
      'Drums should be punchy and clear',
    ],

    rock: [
      'Guitars provide power and drive',
      'Bass and drums locked in rhythm',
      'Use power chords for guitar voicings',
      'Build intensity for choruses',
      'Consider vocal double-tracking',
    ],

    samba: [
      'Percussion is the heartbeat of samba',
      'Cavaquinho plays syncopated chords',
      'Brass sections add festive energy',
      'Bass follows surdo pattern',
      'Layer multiple percussion parts',
    ],

    forro: [
      'Accordion (sanfona) is the lead instrument',
      'Zabumba provides the distinctive rhythm',
      'Triangle adds the high-frequency pulse',
      'Keep it simple and danceable',
      'Emphasize the baião rhythm',
    ],

    classical: [
      'Focus on voice-leading and counterpoint',
      'Use orchestration for dynamics',
      'Reserve space for crescendos',
      'Consider traditional forms (sonata, rondo)',
      'Balance is key between sections',
    ],

    electronic: [
      'Use quantized grid for tightness',
      'Arpeggios create movement',
      'Build-ups and drops for energy',
      'Automate filter sweeps',
      'Layer synths for richness',
    ],

    funk: [
      'Sixteenth-note precision is essential',
      'Bass should be prominent and percussive',
      'Guitar uses sixteenth-note strumming',
      'Horn hits for accent',
      'Leave space (the "one")',
    ],
  };

  return suggestions[style] || ['Custom arrangement style'];
}

/**
 * Get instrument role descriptions
 */
function getInstrumentRoles(instruments: ArrangementInstrument[]): Record<string, string> {
  const roleDescriptions: Record<string, string> = {
    melody: 'Plays the main melodic line - highest priority in mix',
    harmony: 'Provides chordal accompaniment',
    harmony_rhythm: 'Chords with rhythmic character',
    harmony_melody: 'Combines harmony and melody (e.g., piano)',
    pad: 'Sustained chords for atmosphere',
    bass: 'Low-frequency foundation',
    drums: 'Rhythmic foundation',
    percussion: 'Color and rhythmic accent',
    melody_harmony: 'Switches between melody and harmony',
    hits: 'Short accent stabs',
    arpeggio: 'Patterned notes creating movement',
  };

  const roles: Record<string, string> = {};

  for (const inst of instruments) {
    roles[inst.name] = roleDescriptions[inst.role] || inst.role;
  }

  return roles;
}
