import {
  ChordProgression,
  ChordEvent,
  ArrangementStyle,
  MusicalAnalysis,
} from '../types';

export interface HarmonyGenerationParams {
  style: ArrangementStyle;
  key: string;
  scaleType: 'major' | 'minor' | 'harmonic_minor' | 'melodic_minor';
  bars: number;
  timeSignature: string;
}

/**
 * Harmony Agent
 * Analyzes and generates harmonic progressions based on style and music theory
 */
export async function harmonyAgent(
  analysis?: MusicalAnalysis,
  params?: HarmonyGenerationParams
): Promise<{
  analysis?: ChordProgression;
  suggestions: string[];
  progression?: ChordEvent[];
}> {
  // If analysis is provided, extract and enhance existing harmony
  if (analysis?.chords) {
    return analyzeExistingHarmony(analysis);
  }

  // If params provided, generate new harmony
  if (params) {
    return generateHarmony(params);
  }

  // Default response
  return {
    suggestions: [
      'For analysis: provide an existing musical analysis',
      'For generation: specify key, style, and number of bars',
    ],
  };
}

/**
 * Analyze existing harmony from audio analysis
 */
function analyzeExistingHarmony(analysis: MusicalAnalysis) {
  const chords = analysis.chords.chords;
  const key = analysis.chords.key;
  const scaleType = analysis.chords.scaleType;

  const suggestions: string[] = [];

  // Analyze chord quality
  const dominantChords = chords.filter((c) => c.chord.includes('7'));
  const minorChords = chords.filter((c) => c.chord.toLowerCase().includes('m'));

  if (dominantChords.length > chords.length * 0.3) {
    suggestions.push('High density of dominant chords - consider jazz or blues style');
  }

  if (minorChords.length > chords.length * 0.5) {
    suggestions.push('Predominantly minor tonality - suitable for melancholic or dramatic moods');
  }

  // Style-specific suggestions
  if (analysis.sections) {
    suggestions.push('Consider varying harmonic rhythm between sections');
    suggestions.push('Chorus could use more stable harmony (I, IV, V degrees)');
    suggestions.push('Bridge could introduce modal interchange for contrast');
  }

  return {
    analysis: analysis.chords,
    suggestions,
    progression: chords,
  };
}

/**
 * Generate new harmonic progression based on style parameters
 */
function generateHarmony(params: HarmonyGenerationParams) {
  const {style, key, scaleType, bars, timeSignature} = params;

  let progression: ChordEvent[] = [];
  const suggestions: string[] = [];

  const beatsPerBar = parseInt(timeSignature.split('/')[0], 10);
  const totalBeats = bars * beatsPerBar;

  switch (style) {
    case 'bossa_nova':
      progression = generateBossaNovaProgression(key, totalBeats);
      suggestions.push(
        'Bossa nova harmony typically uses: ii-V-I progressions',
        'Add 6/9 and maj7 chords for authentic bossa sound',
        'Consider chromatic passing chords (like #IV diminished)'
      );
      break;

    case 'jazz':
      progression = generateJazzProgression(key, totalBeats);
      suggestions.push(
        'Jazz harmony: extensive use of ii-V-I',
        'Add tritone substitutions for color',
        'Consider ii-V in minor keys for bridge sections'
      );
      break;

    case 'mpb':
      progression = generateMPBProgression(key, totalBeats);
      suggestions.push(
        'MPB mixes traditional Brazilian harmony with sophisticated voicings',
        'Use suspended chords and add9 chords',
        'Consider modulations for chorus/bridge contrast'
      );
      break;

    case 'pop':
      progression = generatePopProgression(key, totalBeats);
      suggestions.push(
        'Pop harmony: I-V-vi-IV (four-chord progression)',
        'Keep harmonic rhythm simple (1-2 chords per bar)',
        'Use inversions for smooth voice leading'
      );
      break;

    case 'samba':
      progression = generateSambaProgression(key, totalBeats);
      suggestions.push(
        'Samba uses similar harmony to bossa but with more rhythmic drive',
        'Consider montuno patterns on percussion',
        'Add brass hits with dominant harmony'
      );
      break;

    case 'forro':
      progression = generateForroProgression(key, totalBeats);
      suggestions.push(
        'Forró: simple I-IV-V progressions',
        'Use major triads with occasional dominant 7th',
        'Consider baião rhythm accent on chord changes'
      );
      break;

    case 'rock':
      progression = generateRockProgression(key, totalBeats);
      suggestions.push(
        'Rock harmony: power chords (root + 5th)',
        'Common: i-VI-VII in minor or I-IV-V in major',
        'Add suspended chords for tension'
      );
      break;

    case 'classical':
      progression = generateClassicalProgression(key, scaleType, totalBeats);
      suggestions.push(
        'Classical harmony follows functional progression',
        'Use secondary dominants for modulation',
        'Consider voice-leading principles (common tones, contrary motion)'
      );
      break;

    case 'electronic':
      progression = generateElectronicProgression(key, totalBeats);
      suggestions.push(
        'Electronic: loop-based 4-8 bar chord progressions',
        'Use extended chords (7th, 9th, 11th)',
        'Consider pedal tone bass for stability'
      );
      break;

    case 'funk':
      progression = generateFunkProgression(key, totalBeats);
      suggestions.push(
        'Funk: extended vamping on single chords',
        'Use 9th, 11th, and 13th chords',
        'Add ghost notes on sixteenth-note grid'
      );
      break;

    default:
      progression = generatePopProgression(key, totalBeats);
  }

  return {
    analysis: {
      chords: progression,
      key,
      scaleType,
    } as ChordProgression,
    suggestions,
    progression,
  };
}

/**
 * Helper: Get scale degrees for a key
 */
function getScaleDegrees(key: string, scaleType: string): string[] {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = notes.indexOf(key.toUpperCase());

  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
  const harmonicMinorIntervals = [0, 2, 3, 5, 7, 8, 11];
  const melodicMinorIntervals = [0, 2, 3, 5, 7, 9, 11];

  const intervals =
    scaleType === 'major'
      ? majorIntervals
      : scaleType === 'harmonic_minor'
        ? harmonicMinorIntervals
        : scaleType === 'melodic_minor'
          ? melodicMinorIntervals
          : minorIntervals;

  return intervals.map((i) => notes[(noteIndex + i) % 12]);
}

/**
 * Helper: Get chord for scale degree
 */
function getChordForDegree(degree: number, key: string, scaleType: string): string {
  const degrees = getScaleDegrees(key, scaleType);
  const romanNumerals: string[] = [
    'I',
    'ii',
    'iii',
    'IV',
    'V',
    'vi',
    'vii°',
  ];

  const chordQuality: Record<string, string> = {
    '0': '', // Major
    '1': 'm', // Minor
    '2': 'm', // Minor
    '3': '', // Major
    '4': '', // Major
    '5': 'm', // Minor
    '6': 'dim', // Diminished
  };

  const note = degrees[degree];
  const quality = scaleType === 'major' ? chordQuality[degree.toString()] : '';

  // Adjust for minor scale
  if (scaleType !== 'major') {
    if (degree === 2 || degree === 5) return note + 'm';
    if (degree === 6) return note + '°';
  }

  return note + quality;
}

// Style-specific progression generators

function generateBossaNovaProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const beatsPerChord = 4;
  const progression = ['II7', 'V7', 'Imaj7', 'VI7', 'II7', 'V7', 'IIIm7', 'V7alt'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    const chord = getChordForDegree(degree % 7, key, 'major');

    chords.push({
      chord: chord.includes('m') ? chord + '7' : chord + '7',
      startBeat: currentBeat,
      durationBeats: beatsPerChord,
    });

    currentBeat += beatsPerChord;
    chordIndex++;
  }

  return chords;
}

function generateJazzProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['II7', 'V7', 'Imaj7', 'VIm7', 'II7', 'V7', 'IIIm7', 'V7alt'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    const rootNote = getScaleDegrees(key, 'major')[degree % 7];
    chords.push({
      chord: rootNote + '7',
      startBeat: currentBeat,
      durationBeats: 2,
    });
    currentBeat += 2;
    chordIndex++;
  }

  return chords;
}

function generateMPBProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['Imaj7', 'VIm7', 'IIm7', 'V7', 'IIIm7', 'VIm7', 'IIm7', 'V7'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    const rootNote = getScaleDegrees(key, 'major')[degree % 7];
    chords.push({
      chord: rootNote + '7',
      startBeat: currentBeat,
      durationBeats: 4,
    });
    currentBeat += 4;
    chordIndex++;
  }

  return chords;
}

function generatePopProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['I', 'V', 'VI', 'IV'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    chords.push({
      chord: getChordForDegree(degree, key, 'major'),
      startBeat: currentBeat,
      durationBeats: 4,
    });
    currentBeat += 4;
    chordIndex++;
  }

  return chords;
}

function generateSambaProgression(key: string, totalBeats: number): ChordEvent[] {
  // Similar to bossa nova but simpler
  return generateBossaNovaProgression(key, totalBeats);
}

function generateForroProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['I', 'IV', 'V', 'I'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    chords.push({
      chord: getChordForDegree(degree, key, 'major'),
      startBeat: currentBeat,
      durationBeats: 4,
    });
    currentBeat += 4;
    chordIndex++;
  }

  return chords;
}

function generateRockProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['I', 'VI', 'VII', 'I'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    chords.push({
      chord: getChordForDegree(degree, key, 'major'),
      startBeat: currentBeat,
      durationBeats: 2,
    });
    currentBeat += 2;
    chordIndex++;
  }

  return chords;
}

function generateClassicalProgression(
  key: string,
  scaleType: string,
  totalBeats: number
): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['I', 'IV', 'V', 'I', 'VI', 'II', 'V', 'I'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    chords.push({
      chord: getChordForDegree(degree, key, scaleType),
      startBeat: currentBeat,
      durationBeats: 2,
    });
    currentBeat += 2;
    chordIndex++;
  }

  return chords;
}

function generateElectronicProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const progression = ['I', 'VI', 'III', 'VII'];

  let currentBeat = 0;
  let chordIndex = 0;

  while (currentBeat < totalBeats) {
    const degree = parseInt(progression[chordIndex % progression.length]);
    const rootNote = getScaleDegrees(key, 'major')[degree % 7];
    chords.push({
      chord: rootNote + 'm9',
      startBeat: currentBeat,
      durationBeats: 4,
    });
    currentBeat += 4;
    chordIndex++;
  }

  return chords;
}

function generateFunkProgression(key: string, totalBeats: number): ChordEvent[] {
  const chords: ChordEvent[] = [];
  const rootNote = getScaleDegrees(key, 'major')[0];

  // Funk typically vamps on one chord
  chords.push({
    chord: rootNote + '9',
    startBeat: 0,
    durationBeats: totalBeats,
  });

  return chords;
}
