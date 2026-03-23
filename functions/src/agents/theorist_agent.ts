import * as admin from 'firebase-admin';
import {MusicScale, MusicChord, MusicProgression} from '../types';

const db = admin.firestore();

interface TheoristInput {
  query?: string;
  key?: string;
  mode?: 'major' | 'minor';
  genre?: string;
}

interface TheoristOutput {
  scales?: MusicScale[];
  chords?: MusicChord[];
  progressions?: MusicProgression[];
  analysis: string;
  suggestions: string[];
}

/**
 * Theorist Agent - Applies music theory knowledge
 * Provides scales, chords, progressions and theoretical analysis
 */
export async function theoristAgent(input: TheoristInput): Promise<TheoristOutput> {
  const {query, key, mode = 'major', genre} = input;

  // Parse query for intent
  const intent = parseQuery(query || '');

  let scales: MusicScale[] = [];
  let chords: MusicChord[] = [];
  let progressions: MusicProgression[] = [];
  let analysis = '';
  const suggestions: string[] = [];

  // Fetch relevant data based on intent
  if (intent.needsScales) {
    scales = await fetchScales(key, mode, genre);
  }

  if (intent.needsChords) {
    chords = await fetchChords(key, genre);
  }

  if (intent.needsProgressions) {
    progressions = await fetchProgressions(genre);
  }

  // Generate analysis
  analysis = generateTheoreticalAnalysis(scales, chords, progressions, genre);

  // Generate suggestions
  suggestions.push(...generateTheorySuggestions(scales, chords, progressions, genre));

  return {
    scales,
    chords,
    progressions,
    analysis,
    suggestions
  };
}

/**
 * Parse query to determine user intent
 */
function parseQuery(query: string): {
  needsScales: boolean;
  needsChords: boolean;
  needsProgressions: boolean;
  isRegional: boolean;
} {
  const lowerQuery = query.toLowerCase();

  return {
    needsScales: lowerQuery.includes('escala') || lowerQuery.includes('scale'),
    needsChords: lowerQuery.includes('acorde') || lowerQuery.includes('chord'),
    needsProgressions: lowerQuery.includes('progressão') || lowerQuery.includes('progression') || lowerQuery.includes('cadência'),
    isRegional: lowerQuery.includes('brega') || lowerQuery.includes('forró') || lowerQuery.includes('tecnobrega')
  };
}

/**
 * Fetch scales from Firestore
 */
async function fetchScales(
  key: string | undefined,
  mode: 'major' | 'minor',
  genre: string | undefined
): Promise<MusicScale[]> {
  const scalesRef = db.collection('music_theory').collection('scales');

  let query = scalesRef;

  // Filter by mode if specified
  if (mode === 'major') {
    query = query.where('type', '==', 'major') as any;
  } else if (mode === 'minor') {
    query = query.where('type', '==', 'minor') as any;
  }

  // Filter by genre if regional
  if (genre?.includes('brega') || genre?.includes('forro')) {
    const genreKey = genre.includes('forro') ? 'forro' : 'brega';
    query = query.where('regional_style', '==', genreKey) as any;
  }

  try {
    const snapshot = await query.limit(12).get();
    return snapshot.docs.map(doc => doc.data() as MusicScale);
  } catch (error) {
    console.warn('Error fetching scales:', error);
    return [];
  }
}

/**
 * Fetch chords from Firestore
 */
async function fetchChords(
  key: string | undefined,
  genre: string | undefined
): Promise<MusicChord[]> {
  const chordsRef = db.collection('music_theory').collection('chords');

  try {
    const snapshot = await chordsRef.limit(24).get();
    const chords = snapshot.docs.map(doc => doc.data() as MusicChord);

    // Prioritize chords with regional voicings
    if (genre?.includes('brega') || genre?.includes('forro')) {
      return chords.filter(chord =>
        chord.voicings.some(v => v.regional_style)
      );
    }

    return chords;
  } catch (error) {
    console.warn('Error fetching chords:', error);
    return [];
  }
}

/**
 * Fetch progressions from Firestore
 */
async function fetchProgressions(genre: string | undefined): Promise<MusicProgression[]> {
  const progressionsRef = db.collection('music_theory').collection('progressions');

  try {
    let query = progressionsRef;

    if (genre?.includes('brega')) {
      query = query.where('category', '==', 'brega') as any;
    } else if (genre?.includes('forro')) {
      query = query.where('category', '==', 'forro') as any;
    } else if (genre?.includes('tecnobrega')) {
      query = query.where('category', '==', 'tecnobrega') as any;
    }

    const snapshot = await query.limit(10).get();
    return snapshot.docs.map(doc => doc.data() as MusicProgression);
  } catch (error) {
    console.warn('Error fetching progressions:', error);
    return [];
  }
}

/**
 * Generate theoretical analysis
 */
function generateTheoreticalAnalysis(
  scales: MusicScale[],
  chords: MusicChord[],
  progressions: MusicProgression[],
  genre: string | undefined
): string {
  const parts: string[] = [];

  // Scale analysis
  if (scales.length > 0) {
    parts.push(`Escalas disponíveis: ${scales.map(s => s.name.pt).join(', ')}`);
  }

  // Chord analysis
  if (chords.length > 0) {
    const chordFamilies = new Set(chords.map(c => c.type));
    parts.push(`Famílias de acordes: ${Array.from(chordFamilies).join(', ')}`);
  }

  // Progression analysis
  if (progressions.length > 0) {
    parts.push(`Progressões sugeridas: ${progressions.map(p => p.name.pt).join(', ')}`);
  }

  // Genre-specific analysis
  if (genre?.includes('brega')) {
    parts.push('Análise Brega: Harmonia emotiva com ênfase em acordes menores relativos e retardos expressivos.');
  } else if (genre?.includes('forro')) {
    parts.push('Análise Forró: Harmonia simples e direta, com padrões rítmicos essenciais');
  } else if (genre?.includes('tecnobrega')) {
    parts.push('Análise Tecnobrega: Harmonia minimalista com ênfase em graves e texturas sintéticas');
  }

  return parts.join('\n\n');
}

/**
 * Generate theory-based suggestions
 */
function generateTheorySuggestions(
  scales: MusicScale[],
  chords: MusicChord[],
  progressions: MusicProgression[],
  genre: string | undefined
): string[] {
  const suggestions: string[] = [];

  // Scale suggestions
  if (scales.length > 0) {
    const pentatonicScales = scales.filter(s => s.type === 'pentatonic');
    if (pentatonicScales.length > 0) {
      suggestions.push('Considere usar escalas pentatônicas para melodias mais acessíveis');
    }

    const modalScales = scales.filter(s => s.type === 'modal');
    if (modalScales.length > 0) {
      suggestions.push('Modos como Dórico e Mixolídio adicionam cor jazzística');
    }
  }

  // Chord suggestions
  if (chords.length > 0) {
    const seventhChords = chords.filter(c => c.type === 'seventh');
    if (seventhChords.length > 0) {
      suggestions.push('Acordes de sétima aumentam a complexidade harmônica');
    }

    const regionalVoicings = chords.filter(c =>
      c.voicings.some(v => v.regional_style)
    );
    if (regionalVoicings.length > 0) {
      suggestions.push('Voicings regionais disponíveis para autenticidade estilística');
    }
  }

  // Progression suggestions
  if (progressions.length > 0) {
    const jazzProgressions = progressions.filter(p => p.category === 'jazz');
    if (jazzProgressions.length > 0) {
      suggestions.push('Progressões jazzísticas como ii-V-I adicionam sofisticação');
    }
  }

  // Genre-specific suggestions
  if (genre?.includes('brega')) {
    suggestions.push(
      'No brega, retardos 4-3 e 9-8 são essenciais para expressão emocional',
      'Use acordes sexta (IV6, I6) para transições suaves'
    );
  } else if (genre?.includes('forro')) {
    suggestions.push(
      'No forró, voicings shell (1-7) dão clareza rítmica',
      'Harmonia simples é preferida para não interferir com o groove'
    );
  }

  return suggestions;
}

/**
 * Get scale degrees for a given scale
 */
export function getScaleDegrees(scaleId: string): number[] {
  const scaleMap: Record<string, number[]> = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor_natural': [0, 2, 3, 5, 7, 8, 10],
    'minor_harmonic': [0, 2, 3, 5, 7, 8, 11],
    'pentatonic_major': [0, 2, 4, 7, 9],
    'pentatonic_minor': [0, 3, 5, 7, 10],
    'blues': [0, 3, 5, 6, 7, 10],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11]
  };

  return scaleMap[scaleId] || scaleMap.major;
}

/**
 * Get chord tones for a given chord symbol
 */
export function getChordTones(chordSymbol: string): number[] {
  const chordMap: Record<string, number[]> = {
    'maj': [0, 4, 7],
    'min': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    '7': [0, 4, 7, 10],
    'dim7': [0, 3, 6, 9],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7]
  };

  // Extract quality from symbol
  const quality = chordSymbol.replace(/[IViv\d]/g, '').replace('/', '') || 'maj';
  return chordMap[quality] || chordMap.maj;
}
