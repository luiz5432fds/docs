import {MelodyContour, MelodyNote, ArrangementStyle, MusicalAnalysis} from '../types';

export interface MelodyGenerationParams {
  style: ArrangementStyle;
  key: string;
  scaleType: 'major' | 'minor' | 'harmonic_minor' | 'melodic_minor';
  bars: number;
  range?: {lowest: number; highest: number};
}

/**
 * Melody Agent
 * Analyzes and generates melodic content based on style and music theory
 */
export async function melodyAgent(
  analysis?: MusicalAnalysis,
  params?: MelodyGenerationParams
): Promise<{
  analysis?: MelodyContour;
  suggestions: string[];
  melody?: MelodyNote[];
}> {
  // If analysis is provided, extract and analyze existing melody
  if (analysis?.melody) {
    return analyzeExistingMelody(analysis);
  }

  // If params provided, generate new melody
  if (params) {
    return generateMelody(params);
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
 * Analyze existing melody from audio analysis
 */
function analyzeExistingMelody(analysis: MusicalAnalysis) {
  const melody = analysis.melody;
  const notes = melody.notes;

  const suggestions: string[] = [];

  // Analyze melodic range
  const range = melody.range;
  const rangeSpan = range.highest - range.lowest;

  if (rangeSpan < 12) {
    suggestions.push('Narrow melodic range - consider expanding for more interest');
  } else if (rangeSpan > 24) {
    suggestions.push('Wide melodic range - good for dramatic effect');
  }

  // Analyze melodic contour
  const ascendingNotes = notes.filter((n, i) => i > 0 && n.pitch > notes[i - 1].pitch).length;
  const descendingNotes = notes.filter((n, i) => i > 0 && n.pitch < notes[i - 1].pitch).length;
  const staticNotes = notes.filter((n, i) => i > 0 && n.pitch === notes[i - 1].pitch).length;

  const totalTransitions = notes.length - 1;
  const ascendingRatio = ascendingNotes / totalTransitions;
  const descendingRatio = descendingNotes / totalTransitions;

  if (ascendingRatio > 0.6) {
    suggestions.push('Predominantly ascending melody - creates tension and anticipation');
  } else if (descendingRatio > 0.6) {
    suggestions.push('Predominantly descending melody - creates resolution and relaxation');
  }

  if (staticNotes > totalTransitions * 0.3) {
    suggestions.push('Many repeated notes - consider more melodic motion');
  }

  // Analyze rhythmic variety
  const uniqueDurations = new Set(notes.map((n) => n.durationBeats)).size;
  if (uniqueDurations < 3) {
    suggestions.push('Limited rhythmic variety - vary note durations for interest');
  }

  return {
    analysis: melody,
    suggestions,
    melody: notes,
  };
}

/**
 * Generate new melody based on style parameters
 */
function generateMelody(params: MelodyGenerationParams) {
  const {style, key, scaleType, bars, range} = params;

  let melody: MelodyNote[] = [];
  const suggestions: string[] = [];

  const beatsPerBar = 4; // Assuming 4/4 for simplicity
  const totalBeats = bars * beatsPerBar;

  // Default range if not specified (one octave)
  const effectiveRange = range || {lowest: 60, highest: 72};

  switch (style) {
    case 'bossa_nova':
      melody = generateBossaNovaMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Bossa nova melody: syncopated rhythms, moderate range',
        'Use anticipations and off-beat phrasing',
        'Guitar-like articulation with short notes'
      );
      break;

    case 'jazz':
      melody = generateJazzMelody(key, scaleType, totalBeats, effectiveRange);
      suggestions.push(
        'Jazz melody: chromatic approach tones, extended range',
        'Use chord tones on strong beats',
        'Consider bebop scales for color'
      );
      break;

    case 'mpb':
      melody = generateMPBMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'MPB melody: lyrical, storytelling quality',
        'Mix stepwise motion with occasional leaps',
        'Natural phrasing following Portuguese lyrics'
      );
      break;

    case 'pop':
      melody = generatePopMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Pop melody: memorable hook, simple contour',
        'Repetitive motifs for catchiness',
        'Limited range for singability (typically one octave)'
      );
      break;

    case 'samba':
      melody = generateSambaMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Samba melody: energetic, call-and-response',
        'Strong rhythmic drive',
        'Often uses pentatonic elements'
      );
      break;

    case 'forro':
      melody = generateForroMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Forró melody: simple, folk-like quality',
        'Zabumba rhythm influences phrasing',
        'Major tonality with pentatonic inflections'
      );
      break;

    case 'rock':
      melody = generateRockMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Rock melody: blues-influenced, gritty',
        'Use bends and slides (adapted to MIDI)',
        'Power chord-compatible intervals'
      );
      break;

    case 'electronic':
      melody = generateElectronicMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Electronic melody: repetitive motifs',
        'Quantized to grid for tightness',
        'Often uses arpeggios and sequences'
      );
      break;

    case 'funk':
      melody = generateFunkMelody(key, totalBeats, effectiveRange);
      suggestions.push(
        'Funk melody: short rhythmic hits',
        'Use sixteenth-note grid precision',
        'Call-and-response with bass'
      );
      break;

    default:
      melody = generatePopMelody(key, totalBeats, effectiveRange);
  }

  return {
    analysis: {
      notes: melody,
      range: effectiveRange,
      tessitura: calculateTessitura(melody),
    } as MelodyContour,
    suggestions,
    melody,
  };
}

/**
 * Get scale notes for melody generation
 */
function getScaleNotes(key: string, scaleType: string): number[] {
  const noteToMidi: Record<string, number> = {
    'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
    'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
    'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
  };

  const baseMidi = noteToMidi[key[0].toUpperCase() + key.slice(1)] || 60;

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

  // Generate multiple octaves
  const notes: number[] = [];
  for (let octave = -1; octave <= 2; octave++) {
    for (const interval of intervals) {
      notes.push(baseMidi + octave * 12 + interval);
    }
  }

  return notes;
}

/**
 * Calculate tessitura (average pitch range) of melody
 */
function calculateTessitura(melody: MelodyNote[]): string {
  if (melody.length === 0) return 'mid';

  const pitches = melody.map((n) => n.pitch);
  const avg = pitches.reduce((a, b) => a + b, 0) / pitches.length;

  if (avg < 60) return 'low';
  if (avg < 72) return 'mid';
  return 'high';
}

// Style-specific melody generators

function generateBossaNovaMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'major');

  let currentBeat = 0;
  let currentPitch = Math.floor((range.lowest + range.highest) / 2);

  while (currentBeat < totalBeats) {
    // Bossa nova syncopation: anticipate beat
    const syncopation = Math.random() > 0.5 ? 0.5 : 0;
    const startBeat = currentBeat + syncopation;

    // Stepwise motion mostly
    const direction = Math.random() > 0.5 ? 1 : -1;
    currentPitch = Math.max(
      range.lowest,
      Math.min(range.highest, currentPitch + direction * 2)
    );

    // Find nearest scale note
    const nearestScale = scale.reduce((prev, curr) =>
      Math.abs(curr - currentPitch) < Math.abs(prev - currentPitch) ? curr : prev
    );

    melody.push({
      pitch: nearestScale,
      startBeat: startBeat,
      durationBeats: 1,
      velocity: 70 + Math.floor(Math.random() * 30),
    });

    currentBeat += 2 + Math.floor(Math.random() * 2);
  }

  return melody;
}

function generateJazzMelody(
  key: string,
  scaleType: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, scaleType);

  let currentBeat = 0;
  let currentPitch = range.lowest + 12;

  while (currentBeat < totalBeats) {
    // Jazz: eighth note motion
    const duration = 0.5;

    // Mix of steps and leaps
    const interval = Math.random() > 0.7 ? 4 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 3);
    const direction = Math.random() > 0.4 ? 1 : -1;

    currentPitch = Math.max(
      range.lowest,
      Math.min(range.highest, currentPitch + direction * interval)
    );

    // Find nearest scale note or add chromatic
    const useChromatic = Math.random() > 0.8;
    const pitch = useChromatic ? currentPitch : scale.reduce((prev, curr) =>
      Math.abs(curr - currentPitch) < Math.abs(prev - currentPitch) ? curr : prev
    );

    melody.push({
      pitch,
      startBeat: currentBeat,
      durationBeats: duration,
      velocity: 60 + Math.floor(Math.random() * 40),
    });

    currentBeat += duration;
  }

  return melody;
}

function generateMPBMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'major');

  let currentBeat = 0;
  let currentPitch = range.lowest + 7;

  while (currentBeat < totalBeats) {
    // MPB: lyrical, varied phrase lengths
    const phraseLength = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < phraseLength && currentBeat < totalBeats; i++) {
      // Mostly stepwise with occasional leaps
      const interval = Math.random() > 0.8 ? 3 + Math.floor(Math.random() * 4) : 1;
      const direction = Math.random() > 0.5 ? 1 : -1;

      currentPitch = Math.max(
        range.lowest,
        Math.min(range.highest, currentPitch + direction * interval)
      );

      const nearestScale = scale.reduce((prev, curr) =>
        Math.abs(curr - currentPitch) < Math.abs(prev - currentPitch) ? curr : prev
      );

      melody.push({
        pitch: nearestScale,
        startBeat: currentBeat,
        durationBeats: 0.5 + Math.random() * 1.5,
        velocity: 65 + Math.floor(Math.random() * 30),
      });

      currentBeat += 1;
    }

    // Breath space between phrases
    currentBeat += 1;
  }

  return melody;
}

function generatePopMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'major');

  // Create memorable motif
  const motifLength = 4 + Math.floor(Math.random() * 4);
  const motif: MelodyNote[] = [];

  let currentBeat = 0;
  let currentPitch = range.lowest + 5;

  // Generate motif
  for (let i = 0; i < motifLength; i++) {
    const direction = Math.random() > 0.4 ? 1 : -1;
    currentPitch = Math.max(
      range.lowest,
      Math.min(range.highest, currentPitch + direction * 2)
    );

    const nearestScale = scale.reduce((prev, curr) =>
      Math.abs(curr - currentPitch) < Math.abs(prev - currentPitch) ? curr : prev
    );

    motif.push({
      pitch: nearestScale,
      startBeat: i,
      durationBeats: 1,
      velocity: 75 + Math.floor(Math.random() * 20),
    });
  }

  // Repeat motif with variation
  let motifIndex = 0;
  while (currentBeat < totalBeats) {
    const motifNote = motif[motifIndex % motif.length];
    const variation = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;

    melody.push({
      pitch: Math.max(range.lowest, Math.min(range.highest, motifNote.pitch + variation)),
      startBeat: currentBeat,
      durationBeats: motifNote.durationBeats,
      velocity: motifNote.velocity,
    });

    currentBeat += motifNote.durationBeats;
    motifIndex++;
  }

  return melody;
}

function generateSambaMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'major');

  let currentBeat = 0;
  let currentPitch = range.lowest + 10;

  while (currentBeat < totalBeats) {
    // Samba: energetic, rhythmic
    const duration = 0.5;

    const direction = Math.random() > 0.4 ? 1 : -1;
    currentPitch = Math.max(
      range.lowest,
      Math.min(range.highest, currentPitch + direction * 3)
    );

    const nearestScale = scale.reduce((prev, curr) =>
      Math.abs(curr - currentPitch) < Math.abs(prev - currentPitch) ? curr : prev
    );

    melody.push({
      pitch: nearestScale,
      startBeat: currentBeat,
      durationBeats: duration,
      velocity: 70 + Math.floor(Math.random() * 35),
    });

    currentBeat += duration;
  }

  return melody;
}

function generateForroMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'major');

  let currentBeat = 0;
  let currentPitch = range.lowest + 8;

  while (currentBeat < totalBeats) {
    // Forró: simple, folk-like
    const duration = 0.5;

    // Mostly stepwise
    const direction = Math.random() > 0.5 ? 1 : -1;
    currentPitch = Math.max(
      range.lowest,
      Math.min(range.highest, currentPitch + direction * 2)
    );

    const nearestScale = scale.reduce((prev, curr) =>
      Math.abs(curr - currentPitch) < Math.abs(prev - currentPitch) ? curr : prev
    );

    melody.push({
      pitch: nearestScale,
      startBeat: currentBeat,
      durationBeats: duration,
      velocity: 65 + Math.floor(Math.random() * 30),
    });

    currentBeat += duration;
  }

  return melody;
}

function generateRockMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];

  // Blues scale
  const bluesIntervals = [0, 3, 5, 6, 7, 10];
  const noteToMidi: Record<string, number> = {
    'C': 60, 'D': 62, 'E': 64, 'F': 65, 'G': 67, 'A': 69, 'B': 71
  };

  const baseMidi = noteToMidi[key[0].toUpperCase()] || 60;
  const scale = bluesIntervals.map((i) => baseMidi + i);

  let currentBeat = 0;

  while (currentBeat < totalBeats) {
    const pitch = scale[Math.floor(Math.random() * scale.length)] + 12;

    melody.push({
      pitch,
      startBeat: currentBeat,
      durationBeats: 0.5,
      velocity: 70 + Math.floor(Math.random() * 40),
    });

    currentBeat += 0.5;
  }

  return melody;
}

function generateElectronicMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'minor');

  // Arpeggio pattern
  const pattern = [0, 3, 7, 10]; // Minor 7th arpeggio
  let patternIndex = 0;
  let currentBeat = 0;

  while (currentBeat < totalBeats) {
    const baseNote = range.lowest + 12;
    const octave = Math.floor(Math.random() * 2);
    const pitch = baseNote + pattern[patternIndex % pattern.length] + octave * 12;

    melody.push({
      pitch: Math.min(range.highest, pitch),
      startBeat: currentBeat,
      durationBeats: 0.25,
      velocity: 80,
    });

    currentBeat += 0.25;
    patternIndex++;
  }

  return melody;
}

function generateFunkMelody(
  key: string,
  totalBeats: number,
  range: {lowest: number; highest: number}
): MelodyNote[] {
  const melody: MelodyNote[] = [];
  const scale = getScaleNotes(key, 'major');

  let currentBeat = 0;

  while (currentBeat < totalBeats) {
    // Funk: short rhythmic hits
    if (Math.random() > 0.5) {
      const pitch = scale[Math.floor(Math.random() * scale.length)];
      melody.push({
        pitch: Math.max(range.lowest, Math.min(range.highest, pitch)),
        startBeat: currentBeat,
        durationBeats: 0.25,
        velocity: 80 + Math.floor(Math.random() * 30),
      });
    }

    currentBeat += 0.25;
  }

  return melody;
}
