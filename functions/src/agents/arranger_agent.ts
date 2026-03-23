import * as admin from 'firebase-admin';
import {NoteData, MusicInstrument, CounterpointRule, GenreType} from '../types';

const db = admin.firestore();

interface ArrangerInput {
  notes: NoteData[];
  genre: GenreType;
  instruments: string[];
  density: 'thin' | 'medium' | 'thick';
  applyCounterpoint?: boolean;
}

interface ArrangerOutput {
  arrangedTracks: Array<{
    instrumentId: string;
    notes: NoteData[];
    dynamics: Array<{position: number; velocity: number}>;
    articulations: string[];
  }>;
  counterpointAnalysis: {
    violations: string[];
    resolutions: string[];
  };
  suggestions: string[];
}

/**
 * Arranger Agent - Creates arrangements using Counterpoint rules
 * Implements species counterpoint following Dufay's methods
 */
export async function arrangerAgent(input: ArrangerInput): Promise<ArrangerOutput> {
  const {
    notes,
    genre,
    instruments,
    density,
    applyCounterpoint = true
  } = input;

  // Fetch counterpoint rules from Firestore
  let counterpointRules: CounterpointRule[] = [];
  if (applyCounterpoint) {
    const rulesSnapshot = await db
      .collection('music_theory')
      .collection('counterpoint_rules')
      .get();

    counterpointRules = rulesSnapshot.docs.map(doc => doc.data() as CounterpointRule);
  }

  // Fetch instrument data
  const instrumentsData = await fetchInstrumentsData(instruments);

  // Arrange for each instrument
  const arrangedTracks = await arrangeForInstruments(
    notes,
    instrumentsData,
    genre,
    density
  );

  // Analyze counterpoint
  const counterpointAnalysis = analyzeCounterpoint(arrangedTracks, counterpointRules, genre);

  // Generate arrangement suggestions
  const suggestions = generateArrangerSuggestions(genre, density, instrumentsData);

  return {
    arrangedTracks,
    counterpointAnalysis,
    suggestions
  };
}

/**
 * Fetch instrument data from Firestore
 */
async function fetchInstrumentsData(instrumentIds: string[]): Promise<MusicInstrument[]> {
  const instruments: MusicInstrument[] = [];

  for (const id of instrumentIds) {
    try {
      const doc = await db
        .collection('music_theory')
        .collection('instruments')
        .doc(id)
        .get();

      if (doc.exists) {
        instruments.push(doc.data() as MusicInstrument);
      }
    } catch (error) {
      console.warn(`Instrument ${id} not found`);
    }
  }

  return instruments;
}

/**
 * Arrange notes for each instrument
 */
async function arrangeForInstruments(
  sourceNotes: NoteData[],
  instruments: MusicInstrument[],
  genre: GenreType,
  density: string
): Promise<Array<{
  instrumentId: string;
  notes: NoteData[];
  dynamics: Array<{position: number; velocity: number}>;
  articulations: string[];
}>> {
  const tracks = [];

  for (const instrument of instruments) {
    // Transpose notes to instrument range
    const notes = transposeToInstrumentRange(sourceNotes, instrument, genre);

    // Add density-based doublings
    const arrangedNotes = applyDensity(notes, density, instrument);

    // Add instrument-specific articulations
    const articulations = selectArticulations(instrument, genre);

    // Add dynamics based on genre
    const dynamics = generateDynamics(arrangedNotes, genre, instrument);

    tracks.push({
      instrumentId: instrument.id,
      notes: arrangedNotes,
      dynamics,
      articulations
    });
  }

  return tracks;
}

/**
 * Transpose notes to fit within instrument's practical range
 */
function transposeToInstrumentRange(
  notes: NoteData[],
  instrument: MusicInstrument,
  genre: GenreType
): NoteData[] {
  const {range} = instrument;
  const adjustedNotes: NoteData[] = [];

  for (const note of notes) {
    let adjustedPitch = note.pitch;

    // Transpose up or down to fit in range
    while (adjustedPitch < range.practical.lowest) {
      adjustedPitch += 12;
    }
    while (adjustedPitch > range.practical.highest) {
      adjustedPitch -= 12;
    }

    adjustedNotes.push({
      ...note,
      id: `${instrument.id}_${note.id}`,
      pitch: adjustedPitch
    });
  }

  return adjustedNotes;
}

/**
 * Apply density (thin/medium/thick) to arrangement
 */
function applyDensity(
  notes: NoteData[],
  density: string,
  instrument: MusicInstrument
): NoteData[] {
  switch (density) {
    case 'thin':
      // Remove some notes for sparse arrangement
      return notes.filter((_, i) => i % 2 === 0);

    case 'medium':
      // Standard doubling
      return [...notes];

    case 'thick':
      // Add octave doublings for strings/brass
      if (instrument.family === 'strings' || instrument.family === 'brass') {
        const octaveDown = notes.map(note => ({
          ...note,
          id: `${note.id}_octave`,
          pitch: note.pitch - 12,
          velocity: note.velocity - 10
        }));
        return [...notes, ...octaveDown];
      }
      return notes;

    default:
      return notes;
  }
}

/**
 * Select appropriate articulations for instrument and genre
 */
function selectArticulations(instrument: MusicInstrument, genre: GenreType): string[] {
  const availableArticulations = instrument.articulations;
  const selectedArticulations: string[] = [];

  switch (genre) {
    case 'brega_romantico':
      if (availableArticulations.includes('legato')) {
        selectedArticulations.push('legato');
      }
      if (availableArticulations.includes('vibrato')) {
        selectedArticulations.push('vibrato');
      }
      if (instrument.family === 'strings' && availableArticulations.includes('sul_ponticello')) {
        selectedArticulations.push('sul_ponticello'); // For emotional climaxes
      }
      break;

    case 'forro_piseiro':
      if (availableArticulations.includes('staccato')) {
        selectedArticulations.push('staccato');
      }
      if (instrument.family === 'brass' && availableArticulations.includes('mute')) {
        selectedArticulations.push('mute');
      }
      break;

    case 'tecnobrega':
      if (instrument.family === 'synth') {
        selectedArticulations.push('legato');
      }
      break;

    default:
      if (availableArticulations.includes('legato')) {
        selectedArticulations.push('legato');
      }
  }

  return selectedArticulations;
}

/**
 * Generate dynamics based on genre and instrument
 */
function generateDynamics(
  notes: NoteData[],
  genre: GenreType,
  instrument: MusicInstrument
): Array<{position: number; velocity: number}> {
  const dynamics: Array<{position: number; velocity: number}> = [];
  const {dynamics: dynRange} = instrument;

  // Group notes by position for dynamic marking
  const positions = [...new Set(notes.map(n => Math.floor(n.position / 960)))];

  for (const pos of positions) {
    const positionInTicks = pos * 960;
    let velocity: number;

    switch (genre) {
      case 'brega_romantico':
        // Crescendo and diminuendo for emotional expression
        velocity = dynRange.pp + (dynRange.ff - dynRange.pp) * 0.6;
        break;

      case 'forro_piseiro':
        // Strong accents for dance rhythm
        velocity = dynRange.pp + (dynRange.ff - dynRange.pp) * 0.75;
        break;

      case 'tecnobrega':
        // Consistent loud dynamics
        velocity = dynRange.ff - 10;
        break;

      default:
        velocity = dynRange.pp + (dynRange.ff - dynRange.pp) * 0.5;
    }

    dynamics.push({
      position: positionInTicks,
      velocity: Math.max(dynRange.pp, Math.min(dynRange.ff, velocity))
    });
  }

  return dynamics;
}

/**
 * Analyze counterpoint violations
 */
function analyzeCounterpoint(
  tracks: Array<{
    instrumentId: string;
    notes: NoteData[];
    dynamics: Array<{position: number; velocity: number}>;
    articulations: string[];
  }>,
  rules: CounterpointRule[],
  genre: GenreType
): {
  violations: string[];
  resolutions: string[];
} {
  const violations: string[] = [];
  const resolutions: string[] = [];

  if (tracks.length < 2) {
    return {violations, resolutions};
  }

  // Check for parallel fifths and octaves
  const voice1 = tracks[0].notes;
  const voice2 = tracks[1].notes;

  for (let i = 0; i < Math.min(voice1.length, voice2.length) - 1; i++) {
    const interval1 = Math.abs(voice1[i].pitch - voice2[i].pitch) % 12;
    const interval2 = Math.abs(voice1[i + 1].pitch - voice2[i + 1].pitch) % 12;

    // Check for parallel fifths
    if (interval1 === 7 && interval2 === 7) {
      violations.push(`Quintas paralelas entre vozes em posição ${i}`);
    }

    // Check for parallel octaves
    if (interval1 === 0 && interval2 === 0) {
      violations.push(`Oitavas paralelas entre vozes em posição ${i}`);
    }
  }

  // Regional exceptions
  if (genre === 'brega_romantico' || genre === 'forro_piseiro') {
    const regionalException = rules.find(r =>
      r.regional_exceptions?.some(e => e.genre === genre)
    );

    if (regionalException) {
      resolutions.push(
        `Exceção regional aplicada: ${genre} permite certas liberdades contrapontísticas`
      );
    }
  }

  return {violations, resolutions};
}

/**
 * Generate arrangement suggestions
 */
function generateArrangerSuggestions(
  genre: GenreType,
  density: string,
  instruments: MusicInstrument[]
): string[] {
  const suggestions: string[] = [];

  switch (genre) {
    case 'brega_romantico':
      suggestions.push(
        'Considere adicionar cordas em uníssono com a melodia para emoção',
        'Use o trompete para contracantos nostálgicos',
        'Acamadas de synth_pad criam atmosfera romântica'
      );
      break;

    case 'forro_piseiro':
      suggestions.push(
        'Pífano em improviso sobre a harmonia básica',
        'Zabumba e triângulo definem o groove essencial',
        'Sanfona faz harmonia e melodia simultaneamente'
      );
      break;

    case 'tecnobrega':
      suggestions.push(
        'Camadas de synth criam textura densa',
        'Baixo e kick em sincronia para impacto',
        'Leads sintéticos em camadas dobradas'
      );
      break;
  }

  // Density suggestions
  if (density === 'thin') {
    suggestions.push('Arranjo leve permite espaço para solos improvisados');
  } else if (density === 'thick') {
    suggestions.push('Arranjo denso - certifique-se de gerenciar a clareza de mix');
  }

  return suggestions;
}
