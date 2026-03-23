import * as admin from 'firebase-admin';
import {GenreType, NoteData} from '../types';

const db = admin.firestore();

interface RegionalInput {
  genre: GenreType;
  notes?: NoteData[];
  instrumentation?: string[];
}

interface RegionalOutput {
  adaptedNotes: NoteData[];
  instrumentation: string[];
  performanceNotes: string[];
  culturalContext: string[];
  grooveTemplate: {
    swing: number;
    accentPattern: number[];
    microTiming: number[];
  };
}

/**
 * Regional Agent - Adapts music for Northeast Brazilian genres
 * Specializes in Brega, Forró, and Tecnobrega styles
 */
export async function regionalAgent(input: RegionalInput): Promise<RegionalOutput> {
  const {genre, notes = [], instrumentation = []} = input;

  // Fetch genre template
  const genreTemplate = await fetchGenreTemplate(genre);

  // Adapt notes to regional style
  const adaptedNotes = adaptNotesToRegionalStyle(notes, genre, genreTemplate);

  // Get appropriate instrumentation
  const regionalInstrumentation = getRegionalInstrumentation(genre, instrumentation);

  // Generate performance notes
  const performanceNotes = generatePerformanceNotes(genre);

  // Generate cultural context
  const culturalContext = generateCulturalContext(genre);

  return {
    adaptedNotes,
    instrumentation: regionalInstrumentation,
    performanceNotes,
    culturalContext,
    grooveTemplate: genreTemplate?.groove_template || {
      swing: 0,
      accentPattern: [1, 0.5, 1, 0.5],
      microTiming: [0, 50, 0, 50]
    }
  };
}

/**
 * Fetch genre template from Firestore
 */
async function fetchGenreTemplate(genre: GenreType): Promise<any> {
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

  // Default templates by genre
  const defaultTemplates: Record<GenreType, any> = {
    brega_romantico: {
      tempo_range: {min: 85, max: 105},
      groove_template: {
        swing: 0,
        accentPattern: [1, 0.5, 1, 0.5],
        microTiming: [0, 50, 0, 50]
      },
      harmonic_rules: [
        'Ênfase em acordes menores relativos',
        'Retardos 4-3 e 9-8 essenciais'
      ]
    },
    forro_piseiro: {
      tempo_range: {min: 155, max: 175},
      groove_template: {
        swing: 0.4,
        accentPattern: [1, 0.8, 1, 0.8],
        microTiming: [0, 30, 0, 30]
      },
      harmonic_rules: [
        'I-IV-I-V padrão baião',
        'Voicings shell para clareza'
      ]
    },
    tecnobrega: {
      tempo_range: {min: 120, max: 135},
      groove_template: {
        swing: 0,
        accentPattern: [1, 1, 1, 1],
        microTiming: [0, 0, 0, 0]
      },
      harmonic_rules: [
        'i-VI-III-VII (andróginas)',
        'Padrões repetitivos'
      ]
    },
    pop_nacional: {
      tempo_range: {min: 100, max: 130},
      groove_template: {
        swing: 0.1,
        accentPattern: [1, 0.7, 1, 0.7],
        microTiming: [0, 20, 0, 20]
      },
      harmonic_rules: []
    }
  };

  return defaultTemplates[genre] || defaultTemplates.pop_nacional;
}

/**
 * Adapt notes to regional style
 */
function adaptNotesToRegionalStyle(
  notes: NoteData[],
  genre: GenreType,
  template: any
): NoteData[] {
  if (notes.length === 0) return [];

  const adapted = [...notes];
  const groove = template.groove_template;

  // Apply regional timing adjustments
  for (let i = 0; i < adapted.length; i++) {
    const beat = i % 4;
    const accent = groove.accentPattern[beat];
    const microTiming = groove.microTiming[beat];

    // Adjust velocity based on accent pattern
    adapted[i].velocity = Math.floor(adapted[i].velocity * accent);

    // Apply micro-timing
    adapted[i].position += microTiming;

    // Apply genre-specific articulations
    switch (genre) {
      case 'brega_romantico':
        // Add slight rubato for emotional expression
        if (beat === 0 || beat === 2) {
          adapted[i].duration *= 1.05; // Slight lengthening
        }
        break;

      case 'forro_piseiro':
        // Add swing to offbeats
        if (beat === 1 || beat === 3) {
          adapted[i].position += groove.swing * 30;
        }
        break;

      case 'tecnobrega':
        // Quantize tightly for electronic feel
        adapted[i].position = Math.round(adapted[i].position / 10) * 10;
        break;
    }
  }

  return adapted;
}

/**
 * Get regional instrumentation recommendations
 */
function getRegionalInstrumentation(genre: GenreType, current: string[]): string[] {
  const regionalInstrumentation: Record<GenreType, string[]> = {
    brega_romantico: [
      'piano',
      'synth_pad',
      'strings',
      'saxophone',
      'trumpet',
      'double_bass',
      'synth_bass'
    ],
    forro_piseiro: [
      'sanfona',
      'zabumba',
      'triangulo',
      'pifano',
      'guitarra',
      'baixo_elétrico'
    ],
    tecnobrega: [
      'synth_lead',
      'synth_pad',
      'synth_bass',
      'bateria_808',
      'sampler',
      'piano'
    ],
    pop_nacional: [
      'piano',
      'guitarra',
      'baixo_elétrico',
      'bateria',
      'synth_pad',
      'strings'
    ]
  };

  // Combine with current instrumentation, prioritizing regional instruments
  const recommended = regionalInstrumentation[genre] || [];
  const combined = [...new Set([...recommended, ...current])];

  return combined;
}

/**
 * Generate performance notes for regional styles
 */
function generatePerformanceNotes(genre: GenreType): string[] {
  const notes: Record<GenreType, string[]> = {
    brega_romantico: [
      'Use expressividade vibratória nas frases melódicas',
      'Retardos 4-3 e 9-8 são essenciais no fraseado',
      'Pequenos rubatos nos cadenciamentos',
      'Crescendo gradual em direção ao clímax emocional',
      'Vibrato晚了 início das notas longas para máximo efeito'
    ],
    forro_piseiro: [
      'Mantenha o ritmo de baião constante',
      'Síncopas leves nas vozes internas',
      'Zabumba: acentos no 1 e 3 (ou 2 e 4 no inverso)',
      'Triângulo: padrão sextilado constante',
      'Sanfona: ornamentação moderada com trilos'
    ],
    tecnobrega: [
      'Quantização rígida para feel eletrônico',
      'Padrões repetitivos de 4-8 compassos',
      'Baixo em sincronia com o kick',
      'Leads sintéticos em camadas dobradas',
      'Automação de filtro para transições'
    ],
    pop_nacional: [
      'Groove consistente com ligeira variação',
      'Backphrasing para feel mais natural',
      'Dinâmica sutil entre estrofes e refrão',
      'Harmonias vocais bem ajustadas'
    ]
  };

  return notes[genre] || [];
}

/**
 * Generate cultural context for the genre
 */
function generateCulturalContext(genre: GenreType): string[] {
  const context: Record<GenreType, string[]> = {
    brega_romantico: [
      'Gênero emocional do Norte/Nordeste brasileiro',
      'Temas de amor, saudade e heartbreak',
      'Influência de bolero e romantic latino',
      'Produção nostálgica com reverb abundante',
      'Identidade cultural das classes populares urbanas'
    ],
    forro_piseiro: [
      'Evolução moderna do baião tradicional',
      'Ritmo acelerado para festas e dance floors',
      'Influência do forró eletrônico estilizado',
      'Zabumba e triângulo como marca registrada',
      'Celebração da cultura nordestina contemporânea'
    ],
    tecnobrega: [
      'Gênero eletrônico de Belém do Pará',
      'Fusão de brega com carimbó e tecnologia',
      'Apaixonadinhos como temática central',
      'Sound systems de rua como origem',
      'Produção DIY e distribuição informal'
    ],
    pop_nacional: [
      'Música popular brasileira contemporânea',
      'Fusão de diversos estilos nacionais',
      'Produção de rádio com apelo massivo',
      'Temas urbanos e relacionamentos'
    ]
  };

  return context[genre] || [];
}

/**
 * Get regional scale adaptation
 */
export function getRegionalScale(genre: GenreType): string {
  const scaleMap: Record<GenreType, string> = {
    brega_romantico: 'brega_0',
    forro_piseiro: 'forro_0',
    tecnobrega: 'minor_natural_9',
    pop_nacional: 'major_0'
  };

  return scaleMap[genre] || 'major_0';
}

/**
 * Get regional tempo range
 */
export function getRegionalTempoRange(genre: GenreType): {min: number; max: number} {
  const tempoMap: Record<GenreType, {min: number; max: number}> = {
    brega_romantico: {min: 85, max: 105},
    forro_piseiro: {min: 155, max: 175},
    tecnobrega: {min: 120, max: 135},
    pop_nacional: {min: 100, max: 130}
  };

  return tempoMap[genre] || {min: 90, max: 120};
}

/**
 * Get regional chord preference
 */
export function getRegionalChordPreference(genre: GenreType): string[] {
  const chordMap: Record<GenreType, string[]> = {
    brega_romantico: ['I', 'VI7', 'vi', 'IV', 'V7'],
    forro_piseiro: ['I', 'IV', 'V7', 'ii'],
    tecnobrega: ['i', 'VI', 'III', 'VII'],
    pop_nacional: ['I', 'V7', 'vi', 'IV']
  };

  return chordMap[genre] || ['I', 'IV', 'V7'];
}
