import * as admin from 'firebase-admin';
import {NoteData, SynKronyProject, PartimentoRule, GenreType} from '../types';

const db = admin.firestore();

interface ComposerInput {
  project: SynKronyProject;
  bassLine?: NoteData[];
  bars?: number;
  applyPartimento?: boolean;
}

interface ComposerOutput {
  notes: NoteData[];
  partimentoRealization: {
    bassLine: NoteData[];
    harmony: string[];
    rules: PartimentoRule[];
  };
  suggestions: string[];
}

/**
 * Composer Agent - Generates musical structures using Partimento
 * Implements the Rule of the Octave and other partimento schemas
 */
export async function composerAgent(input: ComposerInput): Promise<ComposerOutput> {
  const {project, bassLine, bars = 16, applyPartimento = true} = input;
  const {genre, bpm, timeSignature, keySignature, partimento_enabled, partimento_schema} = project;

  // Fetch partimento rules from Firestore
  let partimentoRules: PartimentoRule[] = [];
  if (applyPartimento && partimento_enabled) {
    const rulesSnapshot = await db
      .collection('music_theory')
      .collection('partimento_rules')
      .get();

    partimentoRules = rulesSnapshot.docs.map(doc => doc.data() as PartimentoRule);
  }

  // Get genre template
  const genreTemplate = await getGenreTemplate(genre);

  // Generate or use provided bass line
  let bassLine: NoteData[] = [];
  if (bassLine && bassLine.length > 0) {
    bassLine = bassLine;
  } else {
    bassLine = generateBassLine(bars, timeSignature.numerator, genreTemplate);
  }

  // Realize partimento harmony
  const harmony = realizePartimento(bassLine, partimento_schema, partimentoRules, genre);

  // Generate upper voices using counterpoint
  const notes = generateUpperVoices(bassLine, harmony, genre, genreTemplate);

  // Generate suggestions
  const suggestions = generateComposerSuggestions(genre, partimento_schema, harmony);

  return {
    notes,
    partimentoRealization: {
      bassLine,
      harmony,
      rules: partimentoRules
    },
    suggestions
  };
}

/**
 * Fetch genre template from Firestore
 */
async function getGenreTemplate(genre: GenreType): Promise<any> {
  try {
    const templateId = genre.replace('_', '_');
    const doc = await db
      .collection('synkrony')
      .collection('genre_templates')
      .doc(templateId)
      .get();

    if (doc.exists) {
      return doc.data();
    }
  } catch (error) {
    console.warn('Genre template not found, using defaults');
  }

  // Default template
  return {
    tempo_range: {min: 90, max: 120},
    groove_template: {
      swing: 0,
      accent_pattern: [1, 0.5, 1, 0.5],
      micro_timing: [0, 50, 0, 50]
    },
    harmonic_rules: []
  };
}

/**
 * Generate bass line based on genre and time signature
 */
function generateBassLine(
  bars: number,
  beatsPerBar: number,
  genreTemplate: any
): NoteData[] {
  const bassLine: NoteData[] = [];
  const ticksPerBeat = 240;

  // Simplified bass line generation using partimento degrees
  // This is a basic implementation - in production, would be more sophisticated
  const degrees = [0, 4, 3, 4, 0, 4, 5, 4]; // I, V, IV, V pattern

  for (let bar = 0; bar < bars; bar++) {
    const degree = degrees[bar % degrees.length];
    const rootNote = 36 + degree; // C2 as starting point

    for (let beat = 0; beat < beatsPerBar; beat++) {
      const position = (bar * beatsPerBar + beat) * ticksPerBeat;
      const duration = ticksPerBeat;

      bassLine.push({
        id: `bass_${bar}_${beat}`,
        pitch: rootNote,
        duration,
        velocity: genreTemplate.groove_template.accent_pattern[beat % 4] > 0.8 ? 100 : 80,
        position,
        partimento_degree: degree
      });
    }
  }

  return bassLine;
}

/**
 * Realize partimento harmony based on bass line
 */
function realizePartimento(
  bassLine: NoteData[],
  schema: string,
  rules: PartimentoRule[],
  genre: GenreType
): string[] {
  const harmony: string[] = [];

  for (const note of bassLine) {
    const degree = note.partimento_degree ?? 0;

    // Apply partimento rules based on degree
    let chord: string;
    switch (degree) {
      case 0:
        chord = genre === 'brega_romantico' ? 'Imaj7' : 'I';
        break;
      case 1:
        chord = 'ii';
        break;
      case 2:
        chord = genre === 'brega_romantico' ? 'III7' : 'iii';
        break;
      case 3:
        chord = 'IV';
        break;
      case 4:
        chord = 'V7';
        break;
      case 5:
        chord = genre === 'brega_romantico' ? 'VI7' : 'vi';
        break;
      case 6:
        chord = genre === 'forro_piseiro' ? 'V7/IV' : 'viio';
        break;
      default:
        chord = 'I';
    }

    harmony.push(chord);
  }

  return harmony;
}

/**
 * Generate upper voices using counterpoint rules
 */
function generateUpperVoices(
  bassLine: NoteData[],
  harmony: string[],
  genre: GenreType,
  genreTemplate: any
): NoteData[] {
  const upperVoices: NoteData[] = [];

  // Basic implementation - in production, would use full counterpoint engine
  for (let i = 0; i < bassLine.length; i++) {
    const bass = bassLine[i];
    const chord = harmony[i];

    // Generate harmony notes above bass
    const intervals = getChordIntervals(chord);

    for (let voice = 0; voice < intervals.length; voice++) {
      upperVoices.push({
        id: `voice_${voice}_${i}`,
        pitch: bass.pitch + intervals[voice],
        duration: bass.duration * 0.9,
        velocity: bass.velocity - 20,
        position: bass.position,
        partimento_degree: bass.partimento_degree
      });
    }
  }

  return upperVoices;
}

/**
 * Get chord intervals for harmony generation
 */
function getChordIntervals(chordSymbol: string): number[] {
  const intervals: Record<string, number[]> = {
    'I': [12, 16, 19],      // Root, 3rd, 5th
    'ii': [12, 15, 19],     // Minor triad
    'iii': [12, 15, 19],    // Minor triad
    'IV': [12, 16, 19],     // Major triad
    'V7': [12, 16, 19, 22], // Dominant 7th
    'vi': [12, 15, 19],     // Minor triad
    'viio': [12, 15, 18],   // Diminished
    'Imaj7': [12, 16, 19, 23],
    'III7': [12, 16, 19, 22],
    'VI7': [12, 16, 19, 22],
    'V7/IV': [12, 16, 19, 22]
  };

  return intervals[chordSymbol] || [12, 16, 19];
}

/**
 * Generate composer suggestions based on genre and schema
 */
function generateComposerSuggestions(
  genre: GenreType,
  schema: string,
  harmony: string[]
): string[] {
  const suggestions: string[] = [];

  switch (genre) {
    case 'brega_romantico':
      suggestions.push(
        'Adicione retardos 4-3 e 9-8 para expressividade emocional',
        'Considere usar VI7 no início do refrão para tensão',
        'Experimente voicings drop-2 nas cordas para maior dramaticidade'
      );
      break;
    case 'forro_piseiro':
      suggestions.push(
        'Use voicings shell (1-7) para clareza rítmica',
        'Omite a terça do V7 para maior estabilidade',
        'Adicione síncopas nas vozes internas para energia'
      );
      break;
    case 'tecnobrega':
      suggestions.push(
        'Mantenha a harmonia simples e repetitiva',
        'Use sintetizadores em uníssono com o baixo',
        'Adicione layer de sub-bass uma oitava abaixo'
      );
      break;
    default:
      suggestions.push(
        'Aplique a Regra da Oitava para harmonização do baixo',
        'Use cadências autênticas (V-I) para resoluções conclusivas'
      );
  }

  // Partimento-specific suggestions
  if (schema === 'Rule_of_Octave') {
    suggestions.push('Siga a Regra da Oitava para cada grau da escala');
  } else if (schema === 'Forro_Baiao') {
    suggestions.push('Use o padrão I-IV-I-V típico do baião');
  }

  return suggestions;
}
